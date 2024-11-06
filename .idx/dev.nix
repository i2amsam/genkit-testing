# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {
    GENKIT_ENV = "dev";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install-client = "cd client && npm ci --no-audit --prefer-offline --no-progress --timing";
        npm-install-server = "cd server && npm ci --no-audit --prefer-offline --no-progress --timing";

        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "client/index.html" "server/src/index.js" ];
      };
      onStart = {
        start-server = "npx tsx --watch src/index.ts";
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" ];
          manager = "web";
          cwd = "client";
        };
      };
    };
  };
}