if [ "$1" = "unzip-portal-snapshot-bundle" ] ; then 
    mkdir temp
    echo extracting archive: temp/liferay-portal-tomcat-master.7z...
    echo Please wait...
    wget https://releases.liferay.com/portal/snapshot-master/latest/liferay-portal-tomcat-master.7z -P temp
    7z x temp/liferay-portal-tomcat-master.7z > null
    echo Extraction Complete
    ls ./liferay-portal-master
    rm -rf temp
    cd liferay-portal-master
    rm -rf data logs work osgi/state tomcat-*/work
    cd ..

elif [ "$1" = "config-portlets" ] ; then 
    cd config
    # sed -i 's/\"liferayDir\": \"\/Users\/ivan\/Liferay\/CE\/bundles\"/\"liferayDir\": \"$GENERATOR_DIR\/qa\/liferay-portal-master\"/g' *.json
    sed -i 's,/Users/ivan/Liferay/CE/bundles,'"$GENERATOR_DIR"'/qa/liferay-portal-master,g' *.json
    cat angular-portlet.json
    cd ..

elif [ "$1" = "generate-samples" ] ; then 
    node generate-samples.js &&
    cd samples/packages
    ls -l
    cd ../..

elif [ "$1" = "start-and-run" ] ; then 
    parallel -k sh ./setup.sh {} --args{} ::: start-bundle run-script

elif [ "$1" = "start-bundle" ] ; then 
    echo start bundle && cd liferay-portal-master/tomcat-*/bin && sh ./catalina.sh run

elif [ "$1" = "deploy-portlets" ] ; then 
    cd samples
    lerna run deploy &&
    cd ..

elif [ "$1" = "run-script" ] ; then
    echo run-script
    wait-on -t 600000 http://localhost:8080
    ./gradlew -b standalone-poshi.gradle -PposhiRunnerExtPropertyFileNames=poshi-runner.properties runPoshi
    cd liferay-portal-master/tomcat-*/bin
    sh ./shutdown.sh


else
    echo "Usage: setup.sh ( commands ... )"
    echo "commands:"
    echo "  unzip-portal-snapshot-bundle      Download and unzip portal snapshot bundle"
    echo "  config-portlets                   Configure json files to snapshot bundle directory"
    echo "  generate-samples                  Generate sample portlets"
    echo "  start-and-run                     Run liferay bundle and run poshi test"
    echo "  deploy-portlets                   Deploys generated portlets to liferay bundle"
    echo "  start-bundle                      Run liferay bundle"
    echo "  run script                        Run poshi test"

    exit 1
fi