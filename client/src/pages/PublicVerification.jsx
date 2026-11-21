import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'

export default function PublicVerification() {
  const [identifierInput, setIdentifierInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = identifierInput.trim()
    if (!code) {
      setError('Please enter a verification identifier or secure token.')
      setResult(null)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await apiRequest(`/verification/verify?code=${encodeURIComponent(code)}`)
      setResult(response.data)
    } catch (err) {
      setError(err.message || 'Verification service is currently unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setIdentifierInput('')
    setResult(null)
    setError('')
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#EAF2FF] px-3.5 py-1 text-xs font-semibold text-[#0878D1]">
          Institutional Credential Verification
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
          Alumni Credential Verification
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 leading-relaxed">
          Verify institutional alumni credentials, graduation records, and official membership status using our Number Theory-backed verification registry.
        </p>
      </div>

      {/* Verification Query Form */}
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleVerify} className="space-y-4">
          <label htmlFor="verification-code" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Alumni Verification Identifier or Secure Token
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="verification-code"
              type="text"
              value={identifierInput}
              onChange={(e) => {
                setIdentifierInput(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. ALU-000043 or 48-char secure verification token"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono text-slate-800 outline-none transition focus:border-[#0878D1] focus:ring-2 focus:ring-[#EAF2FF]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-[#0878D1] px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0665B2] disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify Status'}
              </button>
              {(identifierInput || result || error) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Identifiers are issued in format <span className="font-mono font-semibold">ALU-XXXXXX</span>. Anyone can independently inspect verification records without authentication.
          </p>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div role="status" className="mt-8 text-center text-sm text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0878D1] border-r-transparent align-[-0.125em]" />
            <p className="mt-2 font-medium">Validating mathematical identifier against institutional registry…</p>
          </div>
        )}

        {/* Client Error Notice */}
        {!loading && error && (
          <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Verification Result Display */}
        {!loading && result && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            {result.isValid && result.status === 'VERIFIED' ? (
              /* Verified Credential State */
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-emerald-950">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-xs">
                      ✓
                    </div>
                    <div>
                      <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                        OFFICIALLY VERIFIED ALUMNI
                      </span>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {result.alumni?.fullName}
                      </h2>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
                    {result.verificationIdentifier}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 border-t border-emerald-200/80 pt-4 text-xs sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">Department</span>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {result.alumni?.department || 'Department on record'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">Graduation Batch</span>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      Class of {result.alumni?.graduationYear || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">Professional Role</span>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {result.alumni?.currentJobTitle || 'Alumni Member'}
                      {result.alumni?.currentCompany ? ` @ ${result.alumni?.currentCompany}` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">Verification Date</span>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {new Date(result.verifiedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-emerald-200/80 pt-4 text-[11px] text-emerald-800">
                  <span>✓ Authenticated via Prime Modulus Affine Transformation</span>
                  <Link to="/directory" className="font-semibold underline hover:text-emerald-900">
                    Browse in Directory →
                  </Link>
                </div>
              </div>
            ) : result.status === 'REVOKED' ? (
              /* Revoked Credential State */
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-2xl text-white shadow-xs">
                      !
                    </div>
                    <div>
                      <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                        CREDENTIAL REVOKED
                      </span>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {result.alumni?.fullName || 'Alumni Record'}
                      </h2>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl">
                    {result.verificationIdentifier}
                  </span>
                </div>

                <div className="mt-4 border-t border-amber-200 pt-3 text-xs">
                  <p className="text-amber-900">
                    This alumni credential was formerly verified on{' '}
                    <span className="font-semibold">
                      {new Date(result.verifiedAt).toLocaleDateString()}
                    </span>{' '}
                    but was <span className="font-bold text-rose-700">revoked</span> on{' '}
                    <span className="font-semibold">
                      {result.revokedAt ? new Date(result.revokedAt).toLocaleDateString() : 'N/A'}
                    </span>.
                  </p>
                  {result.revocationReason && (
                    <p className="mt-2 rounded-lg bg-amber-100/80 p-2 text-amber-900">
                      Reason: {result.revocationReason}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Invalid or Not Found State */
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-950 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-2xl text-white shadow-xs">
                  ✕
                </div>
                <h2 className="mt-3 text-lg font-bold text-slate-900">
                  Verification Failed / Record Not Found
                </h2>
                <p className="mt-2 text-xs text-rose-700 max-w-md mx-auto">
                  {result.message || 'No matching alumni verification record was found for the identifier provided.'}
                </p>
                <p className="mt-4 text-[11px] text-slate-500">
                  Please verify that the identifier was entered accurately (e.g. ALU-000043).
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Section about Verification */}
      <div className="mt-12 rounded-3xl bg-slate-50 p-8 border border-slate-200 text-xs text-slate-600 space-y-3">
        <h3 className="text-sm font-bold text-[#172B45] uppercase tracking-wider">
          How Alumni Verification Works
        </h3>
        <p>
          Every verified graduate of Government Engineering College receives a mathematically derived credential identifier. Using modular arithmetic and reversible affine transformations over a prime modulus, the platform verifies sequence validity and links credentials directly to official administrative institutional records.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link to="/directory" className="font-semibold text-[#0878D1] hover:underline">
            ← Explore Alumni Directory
          </Link>
          <Link to="/about" className="font-semibold text-[#0878D1] hover:underline">
            About the Association →
          </Link>
        </div>
      </div>
    </section>
  )
}
