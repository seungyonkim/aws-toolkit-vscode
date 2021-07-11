import * as fs from 'fs';

/**
 * @param uniqueIdentifier unique identifier of state machine
 * @param cdkOutPath cdk.out path
 * @param stackName name of root stack of the project
 */
export function getCfnDefinitionForStateMachine(uniqueIdentifier: string, cdkOutPath: string, stackName: string) {

    try {
        //var data = fs.readFileSync(cdkOutPath+`/${stackName}.json`,'utf8');
        var data = fs.readFileSync(cdkOutPath+`/${stackName}.template.json`,'utf8');
        var jsonObj = JSON.parse(data)
        var resources = jsonObj.Resources
         //remove last item (CDKMetadata) from resources array
         //resources = resources.slice(0, -1);
        for(var key of Object.keys(resources)){
            if(key === 'CDKMetadata') continue

            var slicedKey = key.slice(0,-8)
            if(slicedKey === uniqueIdentifier){
                jsonObj = jsonObj.Resources[`${key}`].Properties.DefinitionString["Fn::Join"][1]
                data = JSON.stringify(jsonObj)
                data = escape(data)
            }
        }
        
        // fs.writeFile(cdkOutPath+'/templateJson.asl.json', data, { flag: 'w' }, function (err) {
        //      if (err) throw err;
        //  });
        return data
    }
    catch (e) {
        console.error('Error when getting cloudformation definition for a state machine.')
        console.error(e)
    }

}

function escape(str: string) {
    if (typeof (str) != "string") return str;

    var str1 = '{"Ref":'
    var re1 = new RegExp(str1, 'g');
    var str2 = '},""'
    var re2 = new RegExp(str2, 'g')
    return str
        .trim()
        .substring(1)
        .slice(0, -1)
        .trim()
        .substring(1)
        .slice(0, -1)
        .replace(/\"\",/g, '')
        .replace(/\"\"/g, '')
        .replace(/\\/g, '')
        .replace(re1, '')
        .replace(re2, '')
        ;
};