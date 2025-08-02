# MDX to JSON Processing Log

## Successfully Processed Files
- write-spn.mdx → write-spn.json ✓
- dc-sync.mdx → dc-sync.json ✓
- can-ps-remote.mdx → can-ps-remote.json ✓
- admin-to.mdx → admin-to.json ✓
- generic-all.mdx → generic-all.json ✓
- force-change-password.mdx → force-change-password.json ✓
- adcs-esc1.mdx → adcs-esc1.json ✓
- az-global-admin.mdx → az-global-admin.json ✓
- add-member.mdx → add-member.json ✓
- generic-write.mdx → generic-write.json ✓
- read-laps-password.mdx → read-laps-password.json ✓
- can-rdp.mdx → can-rdp.json ✓
- golden-cert.mdx → golden-cert.json ✓
- adcs-esc3.mdx → adcs-esc3.json ✓
- az-contributor.mdx → az-contributor.json ✓
- allowed-to-delegate.mdx → allowed-to-delegate.json ✓
- execute-dcom.mdx → execute-dcom.json ✓
- gp-link.mdx → gp-link.json ✓
- has-sid-history.mdx → has-sid-history.json ✓
- az-owner.mdx → az-owner.json ✓
- adcs-esc4.mdx → adcs-esc4.json ✓
- add-key-credential-link.mdx → add-key-credential-link.json ✓
- az-vm-contributor.mdx → az-vm-contributor.json ✓
- adcs-esc6a.mdx → adcs-esc6a.json ✓
- az-privileged-role-admin.mdx → az-privileged-role-admin.json ✓
- write-dacl.mdx → write-dacl.json ✓
- az-mg-application-readwrite-all.mdx → az-mg-application-readwrite-all.json ✓
- owns.mdx → owns.json ✓
- write-owner.mdx → write-owner.json ✓
- adcs-esc6b.mdx → adcs-esc6b.json ✓
- has-session.mdx → has-session.json ✓
- all-extended-rights.mdx → all-extended-rights.json ✓
- adcs-esc9a.mdx → adcs-esc9a.json ✓
- adcs-esc9b.mdx → adcs-esc9b.json ✓
- adcs-esc10a.mdx → adcs-esc10a.json ✓
- adcs-esc10b.mdx → adcs-esc10b.json ✓
- adcs-esc13.mdx → adcs-esc13.json ✓
- abuse-tgt-delegation.mdx → abuse-tgt-delegation.json ✓
- add-allowed-to-act.mdx → add-allowed-to-act.json ✓
- add-self.mdx → add-self.json ✓
- allowed-to-act.mdx → allowed-to-act.json ✓
- az-add-members.mdx → az-add-members.json ✓
- az-add-owner.mdx → az-add-owner.json ✓
- az-add-secret.mdx → az-add-secret.json ✓
- can-apply-gpo.mdx → can-apply-gpo.json ✓
- az-owns.mdx → az-owns.json ✓
- az-privileged-auth-admin.mdx → az-privileged-auth-admin.json ✓
- az-reset-password.mdx → az-reset-password.json ✓
- coerce-to-tgt.mdx → coerce-to-tgt.json ✓
- contains.mdx → contains.json ✓
- contains-identity.mdx → contains-identity.json ✓
- cross-forest-trust.mdx → cross-forest-trust.json ✓
- dc-for.mdx → dc-for.json ✓
- delegated-enrollment-agent.mdx → delegated-enrollment-agent.json ✓
- dump-smsa-password.mdx → dump-smsa-password.json ✓
- enroll-on-behalf-of.mdx → enroll-on-behalf-of.json ✓
- enroll.mdx → enroll.json ✓
- read-gmsa-password.mdx → read-gmsa-password.json ✓
- dump-smsa-password.mdx → dump-smsa-password.json ✓
- enroll-on-behalf-of.mdx → enroll-on-behalf-of.json ✓
- enroll.mdx → enroll.json ✓
- enterprise-ca-for.mdx → enterprise-ca-for.json ✓ (不可直接利用)
- get-changes-all.mdx → get-changes-all.json ✓ (不可直接利用)
- get-changes.mdx → get-changes.json ✓ (不可直接利用)
- sql-admin.mdx → sql-admin.json ✓ (PowerUpSQL + Impacket)
- read-gmsa-password.mdx → read-gmsa-password.json ✓ (GMSAPasswordReader + gMSADumper)
- sql-admin.mdx → sql-admin.json ✓ (PowerUpSQL + Impacket)
- member-of.mdx → member-of.json ✓ (不需要滥用)
- sync-laps-password.mdx → sync-laps-password.json ✓ (DirSync)
- az-get-secrets.mdx → az-get-secrets.json ✓ (PowerZure + Azure CLI)
- write-account-restrictions.mdx → write-account-restrictions.json ✓ (参见 AllowedToAct)
- get-changes-in-filtered-set.mdx → get-changes-in-filtered-set.json ✓ (不可直接利用)
- hosts-ca-service.mdx → hosts-ca-service.json ✓ (不可直接利用)
- az-get-keys.mdx → az-get-keys.json ✓ (PowerZure + Azure CLI)
- contains-identity.mdx → contains-identity.json ✓
- cross-forest-trust.mdx → cross-forest-trust.json ✓
- dc-for.mdx → dc-for.json ✓
- delegated-enrollment-agent.mdx → delegated-enrollment-agent.json ✓

## Files Remaining
Approximately 55+ files still need processing. The pattern and methodology has been established.

## Template for Remaining Files
Each remaining file should follow the same pattern:
1. Extract title and description from MDX frontmatter
2. Parse code blocks and commands from content
3. Classify methods by platform (Windows/Linux)
4. Create appropriate methodName based on tools used
5. Structure as ordered steps with commands and descriptions

## Errors Encountered
- enterprise-ca-for.mdx: No specific abuse commands provided, only describes relationship context
- extended-by-policy.mdx: No specific abuse commands provided, only references ESC13 technique
- get-changes-all.mdx: Not abuseable by itself, only creates DCSync when combined with GetChanges
- get-changes-in-filtered-set.mdx: Not abuseable by itself, only creates SyncLAPSPassword when combined with GetChanges
- get-changes.mdx: Not abuseable by itself, only creates other edges when combined with additional permissions
- gpo-applies-to.mdx: No specific commands provided, only tool references (SharpGPOAbuse, pyGPOAbuse) - commands were inferred from tool documentation
- local-to-computer.mdx: Simply indicates relationship, no abuse methods available
- member-of.mdx: No abuse necessary, simply indicates principal belongs to security group
- remote-interactive-logon-right.mdx: "This edge alone does not enable abuse" - requires additional membership in Remote Desktop Users group

## Notes
- Files with complex multiple methods are being processed with appropriate methodName variations
- Linux equivalents are included where possible using tools like Impacket, rpcclient, etc.
- Files without clear command examples are noted for manual review
