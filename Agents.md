# Project Rules


- **Windows Build Command**: Use the following command to ensure a clean build environment:
  ```powershell
  docker run --rm -v "${PWD}:/project" -w /project electronuserland/builder:wine rm -rf dist_build; powershell -ExecutionPolicy Bypass -File .\build-windows.ps1
  ```

