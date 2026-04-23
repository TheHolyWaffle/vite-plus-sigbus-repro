# vite-plus 0.1.16+ SIGBUS reproduction

Minimal reproduction for https://github.com/voidzero-dev/vite-plus/issues/1451.

## What it shows

- `sigbus` job: `vp run test` with the default `cache: true` on the task SIGBUSes the
  vitest worker when running inside a container with a small `/dev/shm` (64 MiB here,
  same order as a default GitLab Kubernetes runner).
- `workaround` job: same thing with `cache: false` on the task passes.

## Reproduce locally

```bash
npm ci
# Fails with "Bus error (core dumped)" + "Worker exited unexpectedly"
docker run --rm --shm-size=64m -v "$PWD":/work -w /work node:24.15.0 \
  bash -c 'npm ci --prefer-offline && npx vp run --filter "*" test --no-cache'
```

Change `cache: true` → `cache: false` on the `test` task in `vite.config.ts` and the
same command succeeds.

## Why

`vp run` (when `cache` is not `false`) wires vite-task's fspy file-access tracking,
which allocates a 4 GiB shared-memory region per task via `shm_open`/`memfd_create`.
On a `/dev/shm`-constrained host, pages touched beyond the backing limit fault with
SIGBUS. Setting `cache: false` resolves to `UserCacheConfig::Disabled` in
`vite_task_graph::config`, which skips the fspy IPC channel (and the env allowlist)
entirely — matching the pre-0.1.16 behavior.
