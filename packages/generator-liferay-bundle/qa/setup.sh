if [ "$1" = "unzip-portal-snapshot-bundle" ] ; then
    mkdir temp
    echo Downloading archive: temp/liferay-portal-tomcat-master.7z...
    echo Please wait...
    wget https://releases.liferay.com/portal/snapshot-master/latest/liferay-portal-tomcat-master.7z -P temp
    echo Extracting archive...
    7z x temp/liferay-portal-tomcat-master.7z > null
    echo Extraction Complete
    ls ./liferay-portal-master
    rm -rf temp
    cd liferay-portal-master
    rm -rf data logs work osgi/state tomcat-*/work
    cd ..

elif [ "$1" = "prepare-portal-properties" ] ; then
    cp poshi/portal-ext.properties liferay-portal-master

elif [ "$1" = "config-portlets" ] ; then
    cd config
    # sed -i 's/\"liferayDir\": \"\/Users\/ivan\/Liferay\/CE\/bundles\"/\"liferayDir\": \"$GENERATOR_DIR\/qa\/liferay-portal-master\"/g' *.json
    sed -i 's,/Users/ivan/Liferay/CE/bundles,'"$GENERATOR_DIR"'/qa/liferay-portal-master,g' *.json
    #sed -i 's,/Users/ivan/Liferay/CE/bundles,../../../liferay-portal-master,g' *.json
    cat export-bundle.json
    cd ..

elif [ "$1" = "generate-samples" ] ; then
    node generate-samples.js &&
    cd samples/packages
    ls -l
    cd ../..

elif [ "$1" = "start-and-run" ] ; then
    sh ./setup.sh start-bundle &
    sh ./setup.sh run-poshi-test

elif [ "$1" = "sync-master-poshi-tests" ] ; then
    echo syncing master poshi tests
    echo extracting poshi resource portal-7.1.x-20181128102607-5b0ef97.jar into poshi/standalone...
    echo Please wait...
    cd poshi
    mkdir standalone
    wget https://repository.liferay.com/nexus/content/repositories/liferay-public-releases/com/liferay/poshi/runner/resources/portal-7.1.x/20181128102607-5b0ef97/portal-7.1.x-20181128102607-5b0ef97.jar -P standalone
    7z x standalone/portal-7.1.x-20181128102607-5b0ef97.jar -ostandalone > null
    cd poshi resource jar extracted
    cd master
    echo updating poshi/standalone files with changes from poshi/master
    rsync -a -v . ../standalone/testFunctional
    cd ../..

elif [ "$1" = "start-bundle" ] ; then
    echo start bundle &&
    cd liferay-portal-master/tomcat-*/bin &&
    sh ./catalina.sh run

elif [ "$1" = "deploy-portlets" ] ; then
    cd samples
    sed -i 's,packages/,packages/angular,g' lerna.json
    lerna run deploy
    sed -i 's,packages/angular,packages/export,g' lerna.json
    lerna run deploy
    cd ..

elif [ "$1" = "run-poshi-test" ] ; then
    echo run-poshi-test
    wait-on -t 600000 http://localhost:8080
    ./gradlew -b standalone-poshi.gradle -PposhiRunnerExtPropertyFileNames=poshi-runner.properties runPoshi
    if [ $? -eq 1 ] ; then
        echo "Exit code is 1"
        cd liferay-portal-master/tomcat-*/bin
        sh ./shutdown.sh
        exit 1
    else
        echo "Exit code is not 1"
        cd liferay-portal-master/tomcat-*/bin
        sh ./shutdown.sh
    fi

elif [ "$1" = "create-liferay-bundle-json" ] ; then
    FILE="$HOME/.generator-liferay-bundle.json"

    /bin/cat <<EOM >$FILE
{
    "sdkVersion": "../../../../../..",
    "answers": {
            "facet-deploy": {
                    "liferayPresent": true,
                    "liferayDir": "../../../liferay-portal-master"
            }
    }
}
EOM

else
    echo "Usage: setup.sh ( commands ... )"
    echo "commands:"
    echo "  unzip-portal-snapshot-bundle      Download and unzip portal snapshot bundle"
    echo "  config-portlets                   Configure json files to snapshot bundle directory"
    echo "  generate-samples                  Generate sample portlets"
    echo "  start-and-run                     Run liferay bundle and run poshi test"
    echo "  deploy-portlets                   Deploys generated portlets to liferay bundle"
    echo "  start-bundle                      Run liferay bundle"
    echo "  run-poshi-test                    Run poshi test"

    exit 1
fi