@echo off
rem Globals
set QA_DIR=%cd%
set LOG_FILE=%QA_DIR%/logs/%1.log
set POSHI_FILE=portal-7.1.x-20190110-e3c1b50.jar

rem Check pre-requisites
where 7z > NUL
if not %ERRORLEVEL% == 0 (
    echo "No 7z command found. Please install it as it is needed."
    echo "Hint: install the 'p7zip' package."
    rem exit 1
)

where wget > NUL
if not %ERRORLEVEL% == 0 (
    echo "No wget command found. Please install it as it is needed."
    echo "Hint: install the 'wget' package."
    rem exit 1
)

where lerna > NUL
if not %ERRORLEVEL% == 0 (
    echo "No lerna command found. Please install it as it is needed."
    echo "Hint: run 'npm install -g lerna'."
    rem exit 1
)

if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    set FIREFOX=C:\/Program Files\/Mozilla Firefox\/firefox.exe
) else (
    echo "No Firefox executable found. Please install it or point the FIREFOX env var to its location."
    rem exit 1
)

rem OTHER WINDOWS requirements
rem install jrepl
rem install rsync

rem Do things
if "%1" == "test-all-samples" (
    call:task test-all-samples

    setup.bat clean
    setup.bat unzip-portal-snapshot-bundle
    setup.bat generate-samples
)

if "%1" == "clean" (
    call:task clean

    echo Cleaning miscellaneous work files
    rmdir /s /q .gradle build liferay-portal-master poshi\standalone poshi\dependencies test-results 2>nul
    echo Cleaning generated samples
    git clean -dfx config >> %LOG_FILE% 2>&1
    echo Cleaning samples
    rmdir /s /q samples 2>nul
    goto:eof
)

if "%1" == "unzip-portal-snapshot-bundle" (
    call:task unzip-portal-snapshot-bundle

    echo Downloading liferay-portal-tomcat-master.7z
    rmdir /s /q temp 2>nul
    rmdir /s /q liferay-portal-master 2>nul
    mkdir temp
    wget https://releases.liferay.com/portal/snapshot-master/latest/liferay-portal-tomcat-master.7z -P temp --no-check-certificate >> %LOG_FILE% 2>&1

    echo Extracting archive
    7z x temp/liferay-portal-tomcat-master.7z >> %LOG_FILE% 2>&1

    echo Preparing Tomcat instance
    rmdir /s /q temp
    cd liferay-portal-master
    rmdir /s /q data logs work osgi\state

    for /D %%D in ("tomcat-*") do (
        rmdir /s /q "%%~D\work\"
    )

    cd ..
    echo Preparing Liferay instance
    copy poshi\portal-ext.properties liferay-portal-master
    goto:eof
)

if "%1" == "generate-samples" (
    call:task generate-samples

    echo Generating sample projects
    node generate-samples.js -p all
    goto:eof
)

if "%1" == "deploy-portlets" (
    call:task deploy-portlets

    echo Invoking deployment in generated samples
    cd samples
    lerna run deploy
    cd ..
    goto:eof
)

if "%1" ==  "sync-master-poshi-tests" (
    call:task sync-master-poshi-tests

    echo Downloading %POSHI_FILE%
    rmdir /s /q poshi\standalone
    md poshi\standalone
    cd poshi\standalone
    wget https://repository.liferay.com/nexus/content/repositories/liferay-public-releases/com/liferay/poshi/runner/resources/portal-7.1.x/20190110-e3c1b50/%POSHI_FILE% --no-check-certificate >> %LOG_FILE% 2>&1

    echo Extracting %POSHI_FILE%
    jar -xvf %POSHI_FILE% >> %LOG_FILE% 2>&1
    del %POSHI_FILE%

    echo Updating poshi/standalone files with changes from poshi/master
    cd ../master
    rsync -a -v . ../standalone/testFunctional >> %LOG_FILE%
    cd ../..

    git checkout poshi-runner.properties
    sed -i -e "s/\/opt\/firefox45\/firefox/%FIREFOX%/g" poshi-runner.properties
    del sed*
    goto:eof
)

if "%1" == "sample-list" (
    call:task sample-list

    echo Filling the list of generated samples to test
    rmdir /s /q poshi/dependencies
    md poshi/dependencies
    cd samples/packages
    dir /b > ../../poshi/dependencies/temp_list.txt
    cd ../../poshi/dependencies
    rem Shared bundle sample projects are not addable widgets that can be tested
    cd poshi/dependencies
    jrepl "\r?\nshared-bundle" "" /m /f temp_list.txt /o -
    jrepl "\r?\n" "," /m /f temp_list.txt /o -
    cd ../..
)

if "%1" == "start-and-run" (
    call:task start-and-run

    setup.bat start-bundle
    start setup.bat run-poshi-test
)


if "%1" == "start-bundle" (
    call:task start-bundle

    echo Starting Tomcat
    cd liferay-portal-master/tomcat-*/bin
    catalina.bat run >> %LOG_FILE%
)


if "%1" == "stop-bundle" (
    call:task stop-bundle

    echo Stopping Tomcat
    cd liferay-portal-master/tomcat-*/bin
    catalina.bat stop >> %LOG_FILE% 2>&1
)


if "%1" == "run-poshi-test" (
    call:task run-poshi-test

    echo Waiting for portal to be available at http://localhost:8080
    del index.html > /dev/null 2>&1
    wget -t 6000 -w 10 --retry-connrefused http://localhost:8080 >> %LOG_FILE% 2>&1
    del index.html > /dev/null 2>&1

    echo Launching poshi tests
    gradlew -b standalone-poshi.gradle -PposhiRunnerExtPropertyFileNames=poshi-runner.properties runPoshi
    POSHI_RESULT=%errorlevel%

    echo Shutting down Tomcat
    setup.bat stop-bundle

    exit %POSHI_RESULT%
)

else (
    echo ""
    echo "Usage: setup.sh ( commands ... )"
    echo ""
    echo "Commands:"
    echo "  test-all-samples                  Run all tests"
    echo ""
    echo "  clean                             Clean all state and files to start from scratch"
    echo "  unzip-portal-snapshot-bundle      Download and unzip portal snapshot bundle"
    echo "  generate-samples                  Generate sample portlets"
    echo "  deploy-portlets                   Deploys generated portlets to liferay bundle"
    echo "  sync-master-poshi-tests           Download poshi resource jar and update with master poshi test files"
    echo "  sample-list                       Prepare the file with the lists of bundles to be tested by Poshi"
    echo "  start-and-run                     Run Liferay bundle and run poshi test"
    echo "  start-bundle                      Start Liferay"
    echo "  stop-bundle                       Stop Liferay"
    echo "  run-poshi-test                    Run poshi test"
    echo ""
)

:task
    echo *** %1
    if not exist logs mkdir logs
    type nul > %LOG_FILE%
exit /b


