# Kubernetes & GitOps (`ops/`)

Source of truth for the Kubernetes cluster. **Argo CD** syncs this directory from the BetterOps repo.

```text
BetterOps repo
     │
     │  push to main (app code; ops/ ignored for CI triggers)
     ▼
GitHub Actions — build & push images (Docker Hub)
     │
     │  update-manifests job
     ▼
Commit new image tags under ops/
     │
     │  Argo CD auto-sync
     ▼
Kubernetes (Cloud)
```

After you change deployments, ingress, or Redis config here, commit to `main` and Argo applies it. Image tags are bumped automatically by CI when application code changes.

## GitHub Actions secrets

| Secret | Purpose |
|--------|---------|
| `DOCKERHUB_USERNAME` | Push images |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

CI uses `GITHUB_TOKEN` to commit manifest bumps (**Settings → Actions → Workflow permissions → Read and write**). Pushes that only change `ops/` do not retrigger the build (avoids loops).

## Argo CD (one-time bootstrap)

Register this repo in Argo, then:

```bash
kubectl apply -f ops/argocd/application.yml
```

Argo syncs `ops/` (excluding `argocd/`, `secrets/`, and `redis/consumer-groups-init.yml`).

## Manual cluster steps

- `kubectl apply -f ops/secrets/secret.yml` — from `secrets/secret.example.yml`, never commit real values
- `kubectl apply -f ops/redis/consumer-groups-init.yml` — once after Redis is up

## Verify

1. Workflow **CI** green after an app change on `main`.
2. Follow-up commit updating `ops/` image SHAs.
3. Argo CD: application **betterops** Synced / Healthy.
4. `kubectl get pods -n betterops`
