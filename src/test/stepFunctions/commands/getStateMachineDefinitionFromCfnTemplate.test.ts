/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert'
import * as getCfnDefinition from '../../../stepFunctions/commands/visualizeStateMachine/getStateMachineDefinitionFromCfnTemplate'

//const escapedJsonString: string = `{\"StartAt\":\"Submit Job\",\"States\":{\"Submit Job\":{\"Next\":\"Wait X Seconds\",\"Type\":\"Task\",\"Resource\":\"",{"Ref":"SubmitJobFB773A16"},"\",\"ResultPath\":\"$.guid\"},\"Wait X Seconds\":{\"Type\":\"Wait\",\"SecondsPath\":\"$.wait_time\",\"Next\":\"Get Job Status\"},\"Get Job Status\":{\"Next\":\"Job Complete?\",\"InputPath\":\"$.guid\",\"Type\":\"Task\",\"Resource\":\"",{"Ref":"CheckJob5FFC1D6F"},"\",\"ResultPath\":\"$.status\"},\"Job Complete?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.status\",\"StringEquals\":\"FAILED\",\"Next\":\"Job Failed\"},{\"Variable\":\"$.status\",\"StringEquals\":\"SUCCEEDED\",\"Next\":\"Get Final Job Status\"}],\"Default\":\"Wait X Seconds\"},\"Job Failed\":{\"Type\":\"Fail\",\"Error\":\"DescribeJob returned FAILED\",\"Cause\":\"AWS Batch Job Failed\"},\"Get Final Job Status\":{\"End\":true,\"InputPath\":\"$.guid\",\"Type\":\"Task\",\"Resource\":\"",{"Ref":"CheckJob5FFC1D6F"},"\"}},\"TimeoutSeconds\":30}`
const unescapedJsonString: string = `{"StartAt":"Submit Job","States":{"Submit Job":{"Next":"Wait X Seconds","Type":"Task","Resource":"","ResultPath":"$.guid"},"Wait X Seconds":{"Type":"Wait","SecondsPath":"$.wait_time","Next":"Get Job Status"},"Get Job Status":{"Next":"Job Complete?","InputPath":"$.guid","Type":"Task","Resource":"","ResultPath":"$.status"},"Job Complete?":{"Type":"Choice","Choices":[{"Variable":"$.status","StringEquals":"FAILED","Next":"Job Failed"},{"Variable":"$.status","StringEquals":"SUCCEEDED","Next":"Get Final Job Status"}],"Default":"Wait X Seconds"},"Job Failed":{"Type":"Fail","Error":"DescribeJob returned FAILED","Cause":"AWS Batch Job Failed"},"Get Final Job Status":{"End":true,"InputPath":"$.guid","Type":"Task","Resource":""}},"TimeoutSeconds":30}`
const unescapedJsonString2: string = `{"StartAt":"Submit Job2","States":{"Submit Job2":{"Next":"Wait X Seconds","Type":"Task","Resource":"","ResultPath":"$.guid"},"Wait X Seconds":{"Type":"Wait","SecondsPath":"$.wait_time","Next":"Get Job Status"},"Get Job Status":{"Next":"Job Complete?","InputPath":"$.guid","Type":"Task","Resource":"","ResultPath":"$.status"},"Job Complete?":{"Type":"Choice","Choices":[{"Variable":"$.status","StringEquals":"FAILED","Next":"Job Failed"},{"Variable":"$.status","StringEquals":"SUCCEEDED","Next":"Get Final Job Status"}],"Default":"Wait X Seconds"},"Job Failed":{"Type":"Fail","Error":"DescribeJob returned FAILED","Cause":"AWS Batch Job Failed"},"Get Final Job Status":{"End":true,"InputPath":"$.guid","Type":"Task","Resource":""}},"TimeoutSeconds":30}`
const uniqueIdendifier = 'MyStateMachine'
const cdkOutPath = __dirname.replace('/dist', '') + '/resources'
const templatePath = cdkOutPath + `/templateJsonTester.template.json`

describe('CDK GetCfnDefinition for State Machines and convert Escaped JSON String to Unescaped ASL.JSON String', function () {
    it('get the correct cfn definition for state machine with correct inputs', async function () {
        let data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate(uniqueIdendifier, templatePath)
        data = getCfnDefinition.toUnescapedAslJsonString(data as string)
        assert.strictEqual(data, unescapedJsonString)
    })

    it('fetch the correct state machine with similar state machine names', async function () {
        let data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate('MyStateMachine2', templatePath)
        data = getCfnDefinition.toUnescapedAslJsonString(data as string)
        assert.strictEqual(data, unescapedJsonString2)
    })

    it('return undefined with wrong templatePath', async function () {
        const data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate(uniqueIdendifier, templatePath + '/wrongpath')
        assert.strictEqual(data, undefined)
    })

    it('return undefined with non-existing uniqueIdentifier', async function () {
        const data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate(uniqueIdendifier + 'wrongidentifier', templatePath)
        assert.strictEqual(data, undefined)
    })

    it('escaped json string not containing any of refRegExp, refRegExp2, fnGetAttRegExp, and fnGetAttRegExp2', async function () {
        const unescapedTesterString = '{"StartAt":"GreetedWorld","States":{"GreetedWorld":{"Type":"Succeed"}}}'
        let data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate('NoRefNoFnGetStateMachine', templatePath)
        data = getCfnDefinition.toUnescapedAslJsonString(data as string)
        assert.strictEqual(data, unescapedTesterString)
    })

    it('escaped json string containing refRegExp, refRegExp2, and fnGetAttRegExp', async function () {
        const unescapedTesterString = '{"StartAt":"Convert to seconds","States":{"Convert to seconds":{"Next":"Publish message","Type":"Task","ResultPath":"$.waitSeconds","Resource":"","Parameters":{"expression":"$.waitMilliseconds / 1000","expressionAttributeValues":{"$.waitMilliseconds.$":"$.waitMilliseconds"}}},"Publish message":{"End":true,"Type":"Task","ResultPath":"$.sns","Resource":"arn:","Parameters":{"TopicArn":"","Message.$":"$.message"}}}}'
        let data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate('RefandFnStateMachine', templatePath)
        data = getCfnDefinition.toUnescapedAslJsonString(data as string)
        assert.strictEqual(data, unescapedTesterString)
    })

    it('escaped json string containing refRegExp, refRegExp2, and fnGetAttRegExp2', async function () {
        const unescapedTesterString = '{"StartAt":"Convert to seconds","States":{"Convert to seconds":{"Next":"Publish message","Type":"Task","ResultPath":"$.waitSeconds","Resource":"","Parameters":{"expression":"$.waitMilliseconds / 1000","expressionAttributeValues":{"$.waitMilliseconds.$":"$.waitMilliseconds"}}},"Publish message":{"End":true,"Type":"Task","ResultPath":"$.sns","Resource":"arn:","Parameters":{"TopicArn":"","Message.$":"$.message"}}}}'
        let data = getCfnDefinition.getStateMachineDefinitionFromCfnTemplate('Ref2andFnStateMachine', templatePath)
        data = getCfnDefinition.toUnescapedAslJsonString(data as string)
        assert.strictEqual(data, unescapedTesterString)
    })
})