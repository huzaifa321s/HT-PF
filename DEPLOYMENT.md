# Production CI/CD

The repository is already checked out at `E:\websites\proposalmaker\HT-PF`. The workflow in `.github/workflows/deploy.yml` validates every push to `main`, then deploys through a Windows self-hosted GitHub Actions runner on this computer.

## One-time server setup

1. In GitHub, open **Settings > Actions > Runners > New self-hosted runner**, choose **Windows x64**, and install the runner on this computer. Add the labels `self-hosted`, `windows`, and `x64` (the default labels normally include these).
2. Configure the runner as a Windows service so it is available after reboot. The runner service account must be able to read/write the project directory and run Node.js and PM2.
3. From `E:\websites\proposalmaker\HT-PF`, register the existing production server with PM2. This project is already registered as `ht-pf-production` and is currently running on port `3001`; do not create a second PM2 process:

   ```powershell
   npm install --global pm2
   pm2 start server.js --name ht-pf-production --time
   pm2 save
   ```

4. Commit and push the current local change in `src/utils/pdfImageAssets.js`, or discard it intentionally. The deployment script refuses to pull over uncommitted files.
5. Push to `main` from any computer. GitHub will run validation and then update this checkout, rebuild Next.js, and restart `proposal-maker` automatically.

## Important behavior

- The deployment is a fast-forward-only Git update; it never force-resets the production checkout.
- A failed lint, build, dirty checkout, missing runner, or missing PM2 app stops the deployment.
- The deployment uses the existing PM2 home at `C:\Users\User.WIN-P4GS0JVSN3R\.pm2`; the runner service must be able to access that account and directory.
- The self-hosted runner executes repository workflow code on this computer. Only allow trusted contributors to push to `main`.