# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pyyaml",
# ]
# ///

import os
import json
import sys
import yaml

convertmap = {
	"az-mg-directory-readwrite-all": "AZMGDirectoryReadWriteAll",
	"az-global-admin": "AZGlobalAdmin",
	"get-changes-in-filtered-set": "GetChangesInFilteredSet",
	"spoof-sid-history": "SpoofSidHistory",
	"az-managed-identity": "AZManagedIdentity",
	"dump-smsa-password": "DumpSmsaPassword",
	"nt-auth-store-for": "NTAuthStoreFor",
	"hosts-ca-service": "HostsCaService",
	"az-owns": "AZOwns",
	"all-extended-rights": "AllExtendedRights",
	"az-add-members": "AZAddMembers",
	"remote-interactive-logon-right": "RemoteInteractiveLogonRight",
	"gp-link": "GpLink",
	"trusted-for-nt-auth": "TrustedForNtAuth",
	"az-key-vault-contributor": "AZKeyVaultContributor",
	"read-laps-password": "ReadLapsPassword",
	"dc-sync": "DcSync",
	"dc-for": "DcFor",
	"write-spn": "WriteSpn",
	"local-to-computer": "LocalToComputer",
	"az-mg-app-role-assignment-readwrite-all": "AZMGAppRoleAssignmentReadWriteAll",
	"az-mg-grant-app-roles": "AZMGGrantAppRoles",
	"overview": "Overview",
	"manage-certificates": "ManageCertificates",
	"az-get-secrets": "AZGetSecrets",
	"az-mg-group-member-readwrite-all": "AZMGGroupMemberReadWriteAll",
	"coerce-to-tgt": "CoerceToTgt",
	"oid-group-link": "OIDGroupLink",
	"az-get-keys": "AZGetKeys",
	"az-aks-contributor": "AZAKSContributor",
	"az-avere-contributor": "AZAvereContributor",
	"az-user-access-administrator": "AZUserAccessAdministrator",
	"az-runs-as": "AZRunsAs",
	"az-contains": "AZContains",
	"az-scoped-to": "AZScopedTo",
	"adcs-esc9b": "ADCSESC9B",
	"az-node-resource-group": "AZNodeResourceGroup",
	"az-mg-service-principal-endpoint-readwrite-all": "AZMGServicePrincipalEndpointReadWriteAll",
	"adcs-esc4": "ADCSESC4",
	"write-owner": "WriteOwner",
	"write-account-restrictions": "WriteAccountRestrictions",
	"az-mg-add-secret": "AZMGAddSecret",
	"az-privileged-role-admin": "AZPrivilegedRoleAdmin",
	"adcs-esc9a": "ADCSESC9A",
	"az-app-admin": "AZAppAdmin",
	"adcs-esc1": "ADCSESC1",
	"az-mg-application-readwrite-all": "AZMGApplicationReadWriteAll",
	"contains-identity": "ContainsIdentity",
	"owns": "Owns",
	"az-add-secret": "AZAddSecret",
	"az-mg-role-management-readwrite-directory": "AZMGRoleManagementReadWriteDirectory",
	"az-vm-admin-login": "AZVMAdminLogin",
	"az-automation-contributor": "AZAutomationContributor",
	"add-key-credential-link": "AddKeyCredentialLink",
	"can-ps-remote": "CanPSRemote",
	"add-allowed-to-act": "AddAllowedToAct",
	"has-trust-keys": "HasTrustKeys",
	"write-gp-link": "WriteGpLink",
	"adcs-esc3": "ADCSESC3",
	"az-mg-add-owner": "AZMGAddOwner",
	"issued-signed-by": "IssuedSignedBy",
	"gpo-applies-to": "GpoAppliesTo",
	"generic-write": "GenericWrite",
	"cross-forest-trust": "CrossForestTrust",
	"can-rdp": "CanRDP",
	"az-add-owner": "AZAddOwner",
	"write-pki-name-flag": "WritePKINameFlag",
	"read-gmsa-password": "ReadGMSAPassword",
	"add-self": "AddSelf",
	"traversable-edges": "TraversableEdges",
	"az-execute-command": "AZExecuteCommand",
	"az-logic-app-contributor": "AZLogicAppContributor",
	"contains": "Contains",
	"propagates-aces-to": "PropagatesACEsTo",
	"published-to": "PublishedTo",
	"generic-all": "GenericAll",
	"adcs-esc6b": "ADCSESC6B",
	"synced-to-ad-user": "SyncedToADUser",
	"same-forest-trust": "SameForestTrust",
	"sync-laps-password": "SyncLapsPassword",
	"enroll-on-behalf-of": "EnrollOnBehalfOf",
	"write-pki-enrollment-flag": "WritePKIEnrollmentFlag",
	"adcs-esc6a": "ADCSESC6A",
	"synced-to-entra-user": "SyncedToEntraUser",
	"az-contributor": "AZContributor",
	"has-sid-history": "HasSIDHistory",
	"allowed-to-act": "AllowedToAct",
	"allowed-to-delegate": "AllowedToDelegate",
	"get-changes": "GetChanges",
	"az-member-of": "AZMemberOf",
	"write-dacl": "WriteDACL",
	"root-ca-for": "RootCAFor",
	"az-get-certificates": "AZGetCertificates",
	"can-apply-gpo": "CanApplyGPO",
	"enterprise-ca-for": "EnterpriseCAFor",
	"force-change-password": "ForceChangePassword",
	"az-vm-contributor": "AZVMContributor",
	"add-member": "AddMember",
	"member-of-local-group": "MemberOfLocalGroup",
	"az-cloud-app-admin": "AZCloudAppAdmin",
	"enroll": "Enroll",
	"az-mg-grant-role": "AZMGGrantRole",
	"sql-admin": "SQLAdmin",
	"az-mg-group-readwrite-all": "AZMGGroupReadWriteAll",
	"az-privileged-auth-admin": "AZPrivilegedAuthAdmin",
	"execute-dcom": "ExecuteDCOM",
	"admin-to": "AdminTo",
	"az-reset-password": "AZResetPassword",
	"extended-by-policy": "ExtendedByPolicy",
	"adcs-esc10b": "ADCSESC10B",
	"has-session": "HasSession",
	"az-has-role": "AZHasRole",
	"adcs-esc13": "ADCSESC13",
	"manage-ca": "ManageCA",
	"adcs-esc10a": "ADCSESC10A",
	"abuse-tgt-delegation": "AbuseTGTDelegation",
	"az-website-contributor": "AZWebsiteContributor",
	"az-owner": "AZOwner",
	"golden-cert": "GoldenCert",
	"delegated-enrollment-agent": "DelegatedEnrollmentAgent",
	"az-mg-add-member": "AZMGAddMember",
	"get-changes-all": "GetChangesAll",
	"member-of": "MemberOf"
}

def get_markdown_header(lines):
    title = lines[1].replace("title: ", "").strip()
    description = lines[2].replace("description: ", "").strip()
    if description == "---":
        return (title, "")
    return (title, description)

def main():
    output = open("./blood.json", "w", encoding="utf-8")
    output_data = {}
    
    loc = "./docs/docs/resources/edges/"
    for dir in os.listdir(loc):
        dir_path = os.path.join(loc, dir)
        print(f"Processing directory: {dir_path}")
        with open(dir_path, "r", encoding="utf-8") as file:
            contents = file.readlines()
            technique, description = get_markdown_header(contents)
            print(f"Technique: {technique}, Description: {description}")
            
            start = 0
            end = len(contents)
            for i in range(0, len(contents)):
                line = contents[i]
                if not line:
                    continue
                if "## Abuse Info" in line:
                    start = i + 1
                if "## opsec" in line.lower() or '## psec ' in line.lower() or '**opsec ' in line.lower() or 'Opsec Considerations' in line:
                    end = i 
                contents[i] = line.replace("\n", "")
                
            contents = contents[start:end]
            final_content = [line for line in contents if line.strip() != ""]
            if start == 0: 
                print(f"Skipping {technique} due to missing abuse info")
                continue
            print(f"Abuse content length: {final_content}")
            
            output_data[technique] = {
                "prefix": technique,
                "description": description[1: -1],
                "body": [ 
                    f"Abuse Edge {technique} is {description[1: -1]}", 
                    *final_content
                ]
            }
                
    print("Converting to vscode snippets format...")
    json.dump(output_data, output, ensure_ascii=False, indent=4)
    output.close()
    print("Conversion complete. Output written to blood.json, entry count:", len(output_data))


if __name__ == "__main__":
    main()


