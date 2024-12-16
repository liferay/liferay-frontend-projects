#!/bin/sh

# Globals
QA_DIR=`pwd`
LOG_FILE="$QA_DIR/logs/$1.log"
POSHI_FILE="portal-7.1.x-20190110-e3c1b50.jar"

# Check pre-requisites
SEVENZIP=7z
which 7z > /dev/null 2>&1
if [ $? != 0 ] ; then
    SEVENZIP=7za
    which 7za > /dev/null 2>&1
    if [ $? != 0 ] ; then
        echo "No 7z command found. Please install it as it is needed."
        echo "Hint: install the 'p7zip' package."
        exit 1
    fi
fi

which wget > /dev/null 2>&1
if [ $? != 0 ] ; then
    echo "No wget command found. Please install it as it is needed."
    echo "Hint: install the 'wget' package."
    exit 1
fi

which lerna > /dev/null 2>&1
if [ $? != 0 ] ; then
    echo "No lerna command found. Please install it as it is needed."
    echo "Hint: run 'npm install -g lerna'."
    exit 1
fi

if [ "$FIREFOX" != "" ] ; then
    FIREFOX=$FIREFOX
elif [ -x /opt/firefox45/firefox ] ; then
    FIREFOX='/opt/firefox45/firefox'
elif [ -x '/Applications/Firefox.app/Contents/MacOS/firefox' ] ; then
    FIREFOX='/Applications/Firefox.app/Contents/MacOS/firefox'
elif [ -x '/usr/bin/firefox' ] ; then
    FIREFOX='/usr/bin/firefox'
else 
    echo "No Firefox executable found. Please install it or point the FIREFOX env var to its location."
    exit 1
fi

# Util methods
task() {
    echo "*** $1"
    mkdir -p logs
    cat /dev/null > $LOG_FILE
}

# Do things
if [ "$1" = "test-all-samples" ] ; then
    task test-all-samples

    sh ./setup.sh clean
    sh ./setup.sh unzip-portal-snapshot-bundle
    sh ./setup.sh generate-samples
    sh ./setup.sh deploy-portlets
    sh ./setup.sh sync-master-poshi-tests
    sh ./setup.sh sample-list
    sh ./setup.sh start-and-run

elif [ "$1" = "clean" ] ; then
    task clean

    echo Cleaning miscellaneous work files
    rm -rf .gradle build liferay-portal-master poshi/standalone poshi/dependencies test-results

    echo Cleaning generated samples
    git clean -dfx config >> $LOG_FILE 2>&1
    rm -rf samples/* 

elif [ "$1" = "unzip-portal-snapshot-bundle" ] ; then
    task unzip-portal-snapshot-bundle

    echo Downloading liferay-portal-tomcat-master.7z
    rm -rf temp 
    rm -rf liferay-portal-master
    mkdir temp 
    wget https://releases.liferay.com/portal/snapshot-master/latest/liferay-portal-tomcat-master.7z -P temp >> $LOG_FILE 2>&1

    echo Extracting archive
    $SEVENZIP x temp/liferay-portal-tomcat-master.7z >> $LOG_FILE
    
    echo Preparing Tomcat instance
    rm -rf temp
    cd liferay-portal-master
    rm -rf data logs work osgi/state tomcat-*/work
    cd ..

    echo Preparing Liferay instance
    cp poshi/portal-ext.properties liferay-portal-master

elif [ "$1" = "generate-samples" ] ; then
    task generate-samples

    echo Generating sample projects
    node generate-samples.js -p all

elif [ "$1" = "deploy-portlets" ] ; then
    task deploy-portlets

    echo Invoking deployment in generated samples
    cd samples
    lerna run deploy
    cd ..

elif [ "$1" = "sync-master-poshi-tests" ] ; then
    task sync-master-poshi-tests

    echo Downloading $POSHI_FILE
    rm -rf poshi/standalone
    mkdir -p poshi/standalone
    cd poshi/standalone
    wget https://repository.liferay.com/nexus/content/repositories/liferay-public-releases/com/liferay/poshi/runner/resources/portal-7.1.x/20190110-e3c1b50/$POSHI_FILE >> $LOG_FILE 2>&1

    echo Extracting $POSHI_FILE
    jar xvf $POSHI_FILE >> $LOG_FILE
    rm $POSHI_FILE

    echo Updating poshi/standalone files with changes from poshi/master
    cd ../master
    rsync -a -v . ../standalone/testFunctional >> $LOG_FILE
    cd ../..

    echo Updating Firefox path in poshi config files
    git checkout poshi-runner.properties
    SUBST=`echo $FIREFOX | sed 's/\//\\\\\//g'`
    sed -i -e "s/\/opt\/firefox45\/firefox/$SUBST/g" poshi-runner.properties
    rm poshi-runner.properties-e > /dev/null 2>&1

elif [ "$1" = "sample-list" ] ; then
    task sample-list

    echo Filling the list of generated samples to test
    rm -rfd poshi/dependencies
    mkdir -p poshi/dependencies 
    mkdir -p samples/packages
    cd samples/packages 
    ls >> ../../poshi/dependencies/temp_list.txt
    cd ../../poshi/dependencies
    # Shared bundle sample projects are not addable widgets that can be tested
    sed -i -e '/shared-bundle/d' temp_list.txt
    tr '\n' ',' < temp_list.txt > sample_list.txt
    rm temp_list.txt
    cd ../..

elif [ "$1" = "start-and-run" ] ; then
    task start-and-run

    sh ./setup.sh start-bundle &
    sh ./setup.sh run-poshi-test

elif [ "$1" = "start-bundle" ] ; then
    task start-bundle 

    echo Starting Tomcat
    cd liferay-portal-master/tomcat-*/bin 
    sh ./catalina.sh run >> $LOG_FILE

elif [ "$1" = "stop-bundle" ] ; then
    task stop-bundle 

    echo Stopping Tomcat
    cd liferay-portal-master/tomcat-*/bin 
    sh ./catalina.sh stop >> $LOG_FILE 2>&1

elif [ "$1" = "run-poshi-test" ] ; then
    task run-poshi-test

    echo Waiting for portal to be available at http://localhost:8080 
    rm index.html > /dev/null 2>&1
    wget -t 6000 -w 10 --retry-connrefused http://localhost:8080 >> $LOG_FILE 2>&1
    rm index.html > /dev/null 2>&1
    
    echo Launching poshi tests
    ./gradlew -b standalone-poshi.gradle -PposhiRunnerExtPropertyFileNames=poshi-runner.properties runPoshi
    POSHI_RESULT=$?

    echo Shutting down Tomcat
    sh ./setup.sh stop-bundle
    
    exit $POSHI_RESULT

else
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
    exit 1
fi