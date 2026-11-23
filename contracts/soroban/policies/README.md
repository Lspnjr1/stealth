# Policies Contract

Gives each mailbox owner explicit control over who can mail them.

Owners can allow or block individual senders, assign sender-specific postage
tiers, decide whether unknown senders are accepted, require sender
verification, require receipts, and set minimum postage. Explicit precedence is
deterministic: block, allow, tier, then mailbox default.

## Interface

- `set_policy(owner, policy)` writes mailbox defaults as the owner.
- `set_policy_as(owner, actor, policy)` lets owner or a policy-scoped delegate write defaults.
- `get_policy(owner)` reads mailbox defaults.
- `get_versioned_policy(owner)` reads mailbox defaults with version.
- `policy_version(owner)` reads the current version.
- `set_delegate(owner, delegate, scope)` grants or revokes scoped mutation authority.
- `delegate_scope(owner, delegate)` reads delegate scope.
- `set_sender_rule(owner, sender, rule)` allows, blocks, or resets a sender as the owner.
- `set_sender_rule_as(owner, actor, sender, rule)` lets owner or sender-scoped delegate mutate sender rules.
- `set_sender_tier(owner, sender, minimum_postage)` assigns sender-specific pricing as owner.
- `set_sender_tier_as(owner, actor, sender, minimum_postage)` assigns sender-specific pricing as owner or delegate.
- `sender_rule(owner, sender)` reads the current sender override.
- `sender_tier(owner, sender)` reads sender-specific pricing.
- `evaluate(...)` returns the complete decision, reason, required postage, sender rule, and policy version.
- `can_mail(...)` returns the boolean result of `evaluate`.

## Precedence

1. Block always denies, regardless of price or mailbox defaults.
2. Allow always admits the sender.
3. Tier applies sender-specific postage after verification and receipt requirements.
4. Mailbox default applies to unknown/default senders.

## Panic-Free Error Handling

This contract is designed for ledger integration reliability with comprehensive panic-free guarantees:

### Error Return Types

All mutable operations return `Result<(), Error>` instead of panicking:

| Error Code | Value | Condition |
|------------|-------|-----------|
| `InvalidPostage` | 1 | Negative postage in policy or tier |
| `UnauthorizedDelegate` | 2 | Actor lacks required delegate scope |

### Storage Default Handling

All read operations return safe defaults when data is missing:

| Function | Default Value |
|----------|---------------|
| `get_policy` | `{ allow_unknown: false, require_verified: true, require_receipt: false, minimum_postage: 0 }` |
| `policy_version` | `0` |
| `sender_rule` | `SenderRule::Default` |
| `sender_tier` | `None` |
| `delegate_scope` | `{ can_set_policy: false, can_set_senders: false }` |

### Arithmetic Safety

- **Version overflow**: Uses `saturating_add` to prevent panic at `u32::MAX`
- **Postage comparison**: Safe `i128` comparisons with no overflow risk

### Authorization

The `require_auth()` calls will abort the transaction on auth failure. This is expected Soroban behavior and not considered a bug—failed authorization should halt execution.
