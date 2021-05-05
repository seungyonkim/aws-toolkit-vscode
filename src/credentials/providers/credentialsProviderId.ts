/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CredentialSourceId } from '../../shared/telemetry/telemetry.gen'

const CREDENTIALS_PROVIDER_ID_SEPARATOR = ':'

export interface CredentialsProviderId {
    /** Credential source id, e.g. "sharedCredentials". */
    readonly credentialSource: CredentialSourceId
    /** User-defined profile name, e.g. "default". */
    readonly credentialTypeId: string
}

/**
 * Gets a user-friendly string represention of the given `CredentialsProvider`.
 *
 * For use in e.g. the statusbar, menus, etc.  Includes:
 * - credentials source kind
 * - instance-identifying information (typically the "profile name")
 *
 * @param credentialsProviderId  Value to be formatted.
 */
export function asString(credentialsProviderId: CredentialsProviderId): string {
    return [credentialsProviderId.credentialSource, credentialsProviderId.credentialTypeId].join(
        CREDENTIALS_PROVIDER_ID_SEPARATOR
    )
}

export function fromString(credentialsProviderId: string): CredentialsProviderId {
    const separatorPos = credentialsProviderId.indexOf(CREDENTIALS_PROVIDER_ID_SEPARATOR)

    if (separatorPos === -1) {
        throw new Error(`Unexpected credentialsProviderId format: ${credentialsProviderId}`)
    }

    // TODO: modify telemetry generator to define enumerable types. https://stackoverflow.com/a/64174790
    function isCredentialSource(s: string): boolean {
        return ['sharedCredentials', 'sdkStore', 'ec2', 'envVars', 'other'].includes(s)
    }
    const credSource = credentialsProviderId.substring(0, separatorPos)
    if (!isCredentialSource(credSource)) {
        throw new Error(`unexpected credentialSource: ${credSource}`)
    }

    return {
        credentialSource: credSource as CredentialSourceId,
        credentialTypeId: credentialsProviderId.substring(separatorPos + 1),
    }
}

export function isEqual(idA: CredentialsProviderId, idB: CredentialsProviderId): boolean {
    return idA.credentialSource === idB.credentialSource && idA.credentialTypeId === idB.credentialTypeId
}
