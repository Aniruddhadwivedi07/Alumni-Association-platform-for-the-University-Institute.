# Alumni Verification System — Number Theory & Affine Modular Transformation

## 1. Overview & Context

The Alumni Association Platform features an institutional **Alumni Verification System** that incorporates classical **Number Theory** concepts into a real-world administrative and public verification workflow.

Rather than exposing database autoincrement primary keys or purely random strings, the system generates mathematically derived, collision-free, reversible verification identifiers formatted as `ALU-XXXXXX` (e.g. `ALU-000043`). Anyone in the public can independently check an alumni member's credential validity via the `/verify` portal, while administrative verification authorities retain full control to approve, reject, or revoke verifications.

---

## 2. Why Number Theory is Used

In academic credential systems, sequential database IDs (1, 2, 3...) leak institutional growth rates, internal volume metrics, and are vulnerable to sequential enumeration attacks. 

By applying an **Affine Modular Transformation** over a finite field defined by a large **Prime Modulus**:
1. Internal sequence allocation is completely decoupled from the public-facing identifier.
2. The transformation creates a pseudorandom permutation (bijection) over the sequence space, ensuring uniform distribution without duplicates.
3. The identifier can be mathematically validated for integrity before running database queries.
4. The transformation is **strictly reversible** via the **Modular Multiplicative Inverse**, allowing the original registration sequence to be recovered without loss.

---

## 3. Mathematical Foundations

### 3.1 Affine Modular Transformation
The verification code $V$ is generated using the linear congruence:

$$V = (a \cdot x + b) \pmod m$$

Where:
- $x$: Unique integer sequence number allocated transactionally from the database ($0 \le x < m$).
- $a$: Multiplication constant (multiplier) satisfying $0 < a < m$ and $\gcd(a, m) = 1$.
- $b$: Additive constant (shift).
- $m$: Prime modulus strictly greater than the maximum supported sequence capacity.
- $V$: Transformed verification number ($0 \le V < m$).

### 3.2 Prime Modulus ($m$)
A prime modulus guarantees that the ring of integers modulo $m$, $\mathbb{Z}/m\mathbb{Z}$, forms a **finite field** (Galois field $\mathbb{F}_m$). Every non-zero element $a \in \mathbb{F}_m^\times$ possesses a unique modular multiplicative inverse $a^{-1} \pmod m$. 

*In production configuration:*
- $m = 1{,}000{,}003$ (a verified prime number $> 10^6$)
- $a = 65{,}537$ ($\gcd(65537, 1000003) = 1$)
- $b = 42{,}857$

### 3.3 Euclidean Algorithm & Greatest Common Divisor (GCD)
The Euclidean algorithm computes the greatest common divisor of two integers through iterative division:

$$\gcd(a, b) = \gcd(b, a \pmod b)$$

Termination occurs when the remainder reaches zero; the last non-zero remainder is the GCD.

### 3.4 Extended Euclidean Algorithm & Modular Multiplicative Inverse
By Bézout's identity, for any integers $a$ and $m$, there exist integers $x$ and $y$ such that:

$$a \cdot x + m \cdot y = \gcd(a, m)$$

When $\gcd(a, m) = 1$:

$$a \cdot x \equiv 1 \pmod m$$

Here $x$ is the modular multiplicative inverse of $a$ modulo $m$, denoted $a^{-1}$. The Extended Euclidean Algorithm tracks quotient and remainder sequences to compute $x$ in $O(\log(\min(a, m)))$ steps.

### 3.5 Inversion / Recovery Transformation
To recover the original numeric sequence $x$ from verification code $V$:

$$x = a^{-1} \cdot (V - b) \pmod m$$

Because $a \cdot a^{-1} \equiv 1 \pmod m$:

$$a^{-1}(V - b) \equiv a^{-1}((a \cdot x + b) - b) \equiv a^{-1} \cdot a \cdot x \equiv x \pmod m$$

All intermediate values and differences $(V - b)$ are normalized to ensure non-negative modular results in $[0, m - 1]$.

---

## 4. Worked Specification Example

Let:
- $m = 101$ (prime modulus)
- $a = 3$ (coprime to 101)
- $b = 7$
- $x = 12$ (alumni verification sequence)

### Step 1: Forward Transformation
$$V = (3 \times 12 + 7) \pmod{101}$$
$$V = (36 + 7) \pmod{101} = 43 \pmod{101} = 43$$

The human-readable identifier is: **`ALU-000043`**.

### Step 2: Extended Euclidean Algorithm for $3^{-1} \pmod{101}$
$$101 = 33 \times 3 + 2 \implies 2 = 101 - 33 \times 3$$
$$3 = 1 \times 2 + 1 \implies 1 = 3 - 1 \times 2$$
$$1 = 3 - 1 \times (101 - 33 \times 3) = 34 \times 3 - 1 \times 101$$

Thus:
$$34 \times 3 \equiv 1 \pmod{101} \implies 3^{-1} \pmod{101} = 34$$

### Step 3: Sequence Recovery
$$x = 34 \times (43 - 7) \pmod{101}$$
$$x = 34 \times 36 \pmod{101}$$
$$34 \times 36 = 1224$$
$$1224 = 12 \times 101 + 12 \implies 1224 \pmod{101} = 12$$

The original sequence $x = 12$ is recovered exactly.

---

## 5. Security Architecture & Cryptographic Separation

> [!IMPORTANT]
> **Reversible Mathematical Obfuscation vs. Cryptography**:
> The affine modular transformation provides non-sequential, deterministic, human-readable identifiers. It is **not** an encryption cipher or digital signature and must never be treated as an access credential or secret token.

To ensure institutional security:
1. **Role-Based Access Control (RBAC)**: Only verified administrators (`ROLES.ADMIN`) can invoke `POST /api/admin/alumni/:id/verify` to approve or revoke credentials.
2. **Self-Verification Prohibition**: Administrators cannot verify or modify their own alumni profiles.
3. **Cryptographically Secure Public Token**: In addition to the mathematical identifier (`ALU-XXXXXX`), a 24-byte cryptographically secure random token is generated via `crypto.randomBytes(24)` upon verification.
4. **Token Hash Storage**: Only the SHA-256 hash (`publicTokenHash`) is stored in the database.
5. **Data Minimization on Public Lookups**: The public verification endpoint (`GET /api/verification/verify?code=...`) returns only institutional directory data (Full Name, Department, Class Year, Role, Status, Verification Date). Private email addresses, password hashes, and admin identities are never disclosed.
6. **Revocation Preservation**: When an administrator revokes a credential, historical records are retained with timestamp and reason, immediately returning `REVOKED` on public lookups.

---

## 6. Database Schema Design

The `AlumniVerification` model links directly with `AlumniProfile`:

```prisma
model AlumniVerification {
  id               Int            @id @default(autoincrement())
  sequenceNumber   Int            @unique
  verificationCode String         @unique
  publicTokenHash  String         @unique
  status           String         @default("VERIFIED") // VERIFIED, REVOKED, REJECTED
  verifiedAt       DateTime       @default(now())
  verifiedById     Int
  revokedAt        DateTime?
  revokedById      Int?
  revocationReason String?
  alumniProfileId  Int            @unique
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  alumniProfile    AlumniProfile  @relation(fields: [alumniProfileId], references: [id], onDelete: Cascade)
  verifiedBy       User           @relation("VerifierAdmin", fields: [verifiedById], references: [id], onDelete: Restrict)
  revokedBy        User?          @relation("RevokerAdmin", fields: [revokedById], references: [id], onDelete: Restrict)

  @@index([verificationCode])
  @@index([publicTokenHash])
  @@index([status])
}
```

Migration file: `server/prisma/migrations/20261116100000_add_alumni_verification/migration.sql`.
