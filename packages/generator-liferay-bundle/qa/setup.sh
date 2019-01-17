if [ "$1" = "test-all-samples" ] ; then
    sh ./setup.sh clean
    sh ./setup.sh unzip-portal-snapshot-bundle
    sh ./setup.sh create-liferay-bundle-json
    sh ./setup.sh config-portlets
    sh ./setup.sh generate-samples
    sh ./setup.sh deploy-portlets
    sh ./setup.sh sync-master-poshi-tests
    sh ./setup.sh sample-list
    sh ./setup.sh start-and-run

elif [ "$1" = "clean" ] ; then
    rm -rf .gradle build liferay-portal-master null poshi/null poshi/standalone poshi/dependencies test-results

elif [ "$1" = "unzip-portal-snapshot-bundle" ] ; then
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
    sh ./setup.sh prepare-portal-properties

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

elif [ "$1" = "prepare-portal-properties" ] ; then
    cp poshi/portal-ext.properties liferay-portal-master

elif [ "$1" = "sample-list" ] ; then
    rm -rfd poshi/dependencies
    mkdir -p poshi/dependencies &&
    cd samples/packages &&
    ls >> ../../poshi/dependencies/temp_list.txt
    cd ../../poshi/dependencies
    # Export bundle sample projects are not addable widgets that can be tested
    sed '/export-bundle/d' -i temp_list.txt
    tr '\n' ',' < temp_list.txt > sample_list.txt
    rm temp_list.txt
    cd ../..

elif [ "$1" = "config-portlets" ] ; then
    cd config
    # sed -i 's/\"liferayDir\": \"\/Users\/ivan\/Liferay\/CE\/bundles\"/\"liferayDir\": \"$GENERATOR_DIR\/qa\/liferay-portal-master\"/g' *.json
    #sed -i 's,/Users/ivan/Liferay/CE/bundles,'"$GENERATOR_DIR"'/qa/liferay-portal-master,g' *.json
    sed -i 's,/Users/ivan/Liferay/CE/bundles,../../../liferay-portal-master,g' *.json
    cat export-bundle.json
    cd ..

elif [ "$1" = "generate-samples" ] ; then
    node generate-samples.js &&
    cd samples/packages
    ls -l
    cd ../..

elif [ "$1" = "deploy-portlets" ] ; then
    cd samples
    sed -i 's/\["packages.*"\]/\["packages\/'"$2"'*"\]/g' lerna.json
    lerna run deploy
    cd ..

elif [ "$1" = "sync-master-poshi-tests" ] ; then
    echo syncing master poshi tests
    echo extracting poshi resource portal-7.1.x-20181128102607-5b0ef97.jar into poshi/standalone...
    echo Please wait...
    cd poshi
    mkdir standalone
    wget https://repository.liferay.com/nexus/content/repositories/liferay-public-releases/com/liferay/poshi/runner/resources/portal-7.1.x/20190110-e3c1b50/portal-7.1.x-20190110-e3c1b50.jar -P standalone
    7z x standalone/portal-7.1.x-20190110-e3c1b50.jar -ostandalone > null
    cd poshi resource jar extracted
    cd master
    echo updating poshi/standalone files with changes from poshi/master
    rsync -a -v . ../standalone/testFunctional
    cd ../..

elif [ "$1" = "start-and-run" ] ; then
    sh ./setup.sh start-bundle &
    sh ./setup.sh run-poshi-test

elif [ "$1" = "start-bundle" ] ; then
    echo start bundle &&
    cd liferay-portal-master/tomcat-*/bin &&
    sh ./catalina.sh run

elif [ "$1" = "run-poshi-test" ] ; then
    echo run-poshi-test
    wait-on -t 600000 http://localhost:8080
    ./gradlew -b standalone-poshi.gradle -PposhiRunnerExtPropertyFileNames=poshi-runner.properties runPoshi
    if [ $? -eq 1 ] ; then
        cd liferay-portal-master/tomcat-*/bin
        sh ./shutdown.sh
        exit 1
    else
        cd liferay-portal-master/tomcat-*/bin
        sh ./shutdown.sh
        exit 1
    fi

else
    echo "Usage: setup.sh ( commands ... )"
    echo "commands:"
    echo "  unzip-portal-snapshot-bundle      Download and unzip portal snapshot bundle"
    echo "  prepare-portal-properties         Download and unzip portal snapshot bundle"
    echo "  config-portlets                   Configure json files to snapshot bundle directory"
    echo "  generate-samples                  Generate sample portlets"
    echo "  deploy-portlets                   Deploys generated portlets to liferay bundle"
    echo "  sync-master-poshi-tests           Download poshi resource jar and update with master poshi test files"
    echo "  start-and-run                     Run liferay bundle and run poshi test"
    echo "  start-bundle                      Run liferay bundle"
    echo "  run-poshi-test                    Run poshi test"
    exit 1
fi