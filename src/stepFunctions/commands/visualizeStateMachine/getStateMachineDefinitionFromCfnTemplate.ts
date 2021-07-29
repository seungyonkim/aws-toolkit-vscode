/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs'

import { getLogger, Logger } from '../../../shared/logger'

/**
 * @param {string} uniqueIdentifier - unique identifier of state machine
 * @param {string} templatePath - path for the template.json file
 * 
 * @returns the escaped ASL Json definition string of the state machine construct
 */
export function getStateMachineDefinitionFromCfnTemplate(uniqueIdentifier: string, templatePath: string) {
    const logger: Logger = getLogger()
    try {
        let data = fs.readFileSync(templatePath, 'utf8')
        const jsonObj = JSON.parse(data)
        const resources = jsonObj.Resources
        let key = ''

        const matchingKeyList: string[] = []
        for (const key of Object.keys(resources)) {
            //the resources list always contains 'CDKMetadata'
            if (key === 'CDKMetadata') continue

            if (key.substring(0, uniqueIdentifier.length) === uniqueIdentifier) {
                matchingKeyList.push(key)
            }
        }
        if (matchingKeyList.length === 0) {
            return
        }
        else if (matchingKeyList.length === 1) {
            key = matchingKeyList.pop()!
        }
        else {
            //return minimun length key in matchingKeyList
            key = matchingKeyList.reduce((a, b) => a.length <= b.length ? a : b)
        }

        const definitionString = jsonObj.Resources[`${key}`].Properties.DefinitionString["Fn::Join"][1]
        data = JSON.stringify(definitionString)
        return data
    }
    catch (err) {
        logger.debug('Unable to extract state machine definition string from template.json file.')
        logger.error(err as Error)
    }
}

export function getDefinitionStringFromTemplateJson(resources: string[]): string | undefined {
    return
}

/**
 * @param {string} escapedAslJsonStr - json state machine construct definition 
 * @returns unescaped json state machine construct definition
 */
export function toUnescapedAslJsonString(escapedAslJsonStr: string) {
    if (typeof (escapedAslJsonStr) != "string") return escapedAslJsonStr;

    const refPrefix = '{"Ref":'
    const refPrefixRegExp = new RegExp(refPrefix, 'g')
    const refSuffix = '},""'
    const refSuffixRegExp = new RegExp(refSuffix, 'g')
    return escapedAslJsonStr
        .trim() //remove leading whitespaces
        .substring(1) //remove square brackets that wrap escapedAslJsonStr
        .slice(0, -1)
        .trim() //remove leading whitespaces
        .substring(1) //remove quotes that wrap escapedAslJsonStr
        .slice(0, -1)
        .replace(/\"\",/g, '') //remove empty quotes followed by a comma
        .replace(/\"\"/g, '') //remove empty quotes
        .replace(/\\/g, '') //remove backslashes
        .replace(refPrefixRegExp, '') //remove Ref prefix
        .replace(refSuffixRegExp, '') //remove Ref suffix
};

export function toUnescapedAslJson(arg0: string): string | undefined {
    throw new Error('Function not implemented.')
}
