#!/bin/bash

mkdir -p "$HOME/.yarn/bin"
curl -L -o "$HOME/.yarn/bin/yarn" https://github.com/yarnpkg/yarn/releases/download/v1.15.2/yarn-1.15.2.js
chmod +x "$HOME/.yarn/bin/yarn"
export PATH="$HOME/.yarn/bin:$PATH"
yarn config delete proxy

export

if [ -n "$WINDIR" ]; then
  # Speed up Yarn install on Windows.
  #
  # See: https://travis-ci.community/t/yarn-network-troubles/333/6

  export NODEPATH=$(where.exe node.exe)
  export PROJECTDIR=$(pwd)
  export YARNCACHE=$(yarn cache dir)
  export TEMPDIR=$LOCALAPPDATA\\Temp

  powershell Add-MpPreference -ExclusionProcess ${NODEPATH}
  powershell Add-MpPreference -ExclusionPath ${YARNCACHE}
  powershell Add-MpPreference -ExclusionPath ${PROJECTDIR}
  powershell Add-MpPreference -ExclusionPath ${TEMPDIR}

  powershell Start-Process -PassThru -Wait PowerShell -ArgumentList "'-Command Set-MpPreference -DisableArchiveScanning \$true'"

  powershell Start-Process -PassThru -Wait PowerShell -ArgumentList "'-Command Set-MpPreference -DisableBehaviorMonitoring \$true'"

  powershell Start-Process -PassThru -Wait PowerShell -ArgumentList "'-Command Set-MpPreference -DisableRealtimeMonitoring \$true'"
fi
