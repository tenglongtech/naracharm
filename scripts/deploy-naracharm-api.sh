#!/usr/bin/env bash
set -euo pipefail

release=${1:-}
if [[ ! $release =~ ^[a-f0-9]{40}$ ]]; then
  echo 'A full Git commit SHA is required.' >&2
  exit 2
fi

name=${NARA_API_CONTAINER:-naracharm-api}
network=${NARA_API_NETWORK:-naracharm_naracharm-net}
env_file=${NARA_API_ENV_FILE:-/opt/naracharm/api/.env}
port=${NARA_API_HOST_PORT:-37001}
repository=${NARA_API_IMAGE:-naracharm-api}
image="$repository:$release"
migrator="$repository:migrate-$release"

if [[ ! $port =~ ^[1-9][0-9]{0,4}$ ]] || (( port > 65535 )); then
  echo 'NARA_API_HOST_PORT must be a valid TCP port.' >&2
  exit 2
fi
if [[ ! -r $env_file ]]; then
  echo 'The API runtime environment file is missing or unreadable.' >&2
  exit 2
fi

candidate=''
replacement=''
previous=''
previous_running=false
cutover=false
deployed=false

cleanup() {
  local result=$?
  trap - EXIT
  set +e
  if [[ -n $candidate ]]; then
    docker rm --force "$candidate" >/dev/null
  fi

  if [[ $cutover == true && $deployed == false ]]; then
    if [[ -n $replacement ]]; then
      docker rm --force "$replacement" >/dev/null
    fi
    if [[ -n $previous ]]; then
      if [[ $(docker inspect --format '{{.Name}}' "$previous") != "/$name" ]]; then
        if ! docker rename "$previous" "$name"; then
          echo "Automatic rollback could not restore container $previous. Inspect the API host." >&2
          exit "$result"
        fi
      fi
      if [[ $previous_running == true ]]; then
        if [[ $(docker inspect --format '{{.State.Running}}' "$previous") != true ]] && ! docker start "$previous" >/dev/null; then
          echo "Automatic rollback could not start container $previous. Inspect the API host." >&2
          exit "$result"
        fi
        if ! wait_for_readiness "http://127.0.0.1:$port/api/health"; then
          echo "Previous API container $previous was restored, but its readiness check failed." >&2
          exit "$result"
        fi
      fi
      echo "Restored the previous API container $previous." >&2
    fi
  fi

  exit "$result"
}

wait_for_readiness() {
  local url=$1 code attempt
  for ((attempt = 1; attempt <= 20; attempt++)); do
    if code=$(curl --silent --show-error --noproxy '*' --max-time 5 --output /dev/null --write-out '%{http_code}' "$url" 2>/dev/null) && [[ $code == 200 ]]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker network inspect "$network" >/dev/null
docker build --target runner --tag "$image" --file apps/web/Dockerfile .
docker build --target migrator --tag "$migrator" --file apps/web/Dockerfile .
docker run --rm --network "$network" --env-file "$env_file" "$migrator"

config=(--network "$network" --env-file "$env_file" --memory 2g)
candidate=$(docker create "${config[@]}" --publish '127.0.0.1::37001' "$image")
docker start "$candidate" >/dev/null
candidate_address=$(docker port "$candidate" 37001/tcp)
if [[ ! $candidate_address =~ ^127\.0\.0\.1:[0-9]+$ ]] || ! wait_for_readiness "http://$candidate_address/api/health"; then
  echo 'Candidate API readiness check failed.' >&2
  exit 1
fi
docker rm --force "$candidate" >/dev/null
candidate=''

previous=$(docker ps --all --format '{{.Names}} {{.ID}}' | awk -v name="$name" '$1 == name { print $2 }')
if [[ -n $previous ]]; then
  previous_running=$(docker inspect --format '{{.State.Running}}' "$previous")
fi
cutover=true
if [[ -n $previous ]]; then
  docker rename "$previous" "$name-previous-$previous"
  if [[ $previous_running == true ]]; then
    docker stop --time 15 "$previous" >/dev/null
  fi
fi

replacement=$(docker create --name "$name" "${config[@]}" --publish "127.0.0.1:$port:37001" --restart unless-stopped "$image")
docker start "$replacement" >/dev/null
if ! wait_for_readiness "http://127.0.0.1:$port/api/health"; then
  echo 'Published API readiness check failed.' >&2
  exit 1
fi
deployed=true
echo "Published API release $release."
if [[ -n $previous ]]; then
  echo "Previous API container retained as $name-previous-$previous."
fi
