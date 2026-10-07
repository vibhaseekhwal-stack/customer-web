import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Gift,
  IndianRupee,
  Link as LinkIcon,
  Loader2,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import {
  applyAffiliate,
  getMyAffiliate,
  getMyAffiliateStats,
  getMyAffiliateEarnings,
  getMyAffiliatePayouts,
  requestAffiliatePayout,
} from '../services/affiliateService'

const STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
}

const CHANNELS = [
  'Instagram',
  'YouTube',
  'WhatsApp',
  'Facebook',
  'Blog',
  'Other',
]

const formatCurrency = (value) => {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatus = (affiliate) =>
  String(
    affiliate?.status ||
      affiliate?.applicationStatus ||
      affiliate?.affiliateStatus ||
      ''
  ).toUpperCase()

const getAffiliateId = (affiliate) =>
  affiliate?.id ||
  affiliate?._id ||
  affiliate?.affiliateId ||
  affiliate?.userId ||
  null

const getReferralCode = (affiliate) =>
  affiliate?.referralCode ||
  affiliate?.code ||
  affiliate?.referral?.code ||
  ''

const getReferralLink = (affiliate) =>
  affiliate?.referralLink ||
  affiliate?.referral?.link ||
  (getReferralCode(affiliate)
    ? `${window.location.origin}/?ref=${getReferralCode(affiliate)}`
    : '')

const normalizeList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizeStats = (value) => {
  const source =
    value?.stats ||
    value?.summary ||
    value?.data ||
    value ||
    {}

  return {
    referrals:
      source?.totalReferrals ??
      source?.referrals ??
      source?.referredCustomers ??
      0,
    orders:
      source?.referredOrders ??
      source?.orders ??
      source?.totalOrders ??
      0,
    revenue:
      source?.attributedRevenue ??
      source?.revenue ??
      source?.totalRevenue ??
      0,
    earned:
      source?.totalEarned ??
      source?.earned ??
      source?.commissionEarned ??
      0,
    available:
      source?.availableBalance ??
      source?.available ??
      source?.balance ??
      0,
    pendingPayout:
      source?.pendingPayout ??
      source?.requestedPayouts ??
      source?.pendingAmount ??
      0,
  }
}

function Affiliate() {
  const [affiliate, setAffiliate] = useState(null)
  const [stats, setStats] = useState(normalizeStats(null))
  const [earnings, setEarnings] = useState([])
  const [payouts, setPayouts] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [payoutSubmitting, setPayoutSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState('')

  const [showApplication, setShowApplication] = useState(false)
  const [showPayout, setShowPayout] = useState(false)

  const [motivation, setMotivation] = useState('')
  const [channel, setChannel] = useState('')
  const [amount, setAmount] = useState('')
  const [upiId, setUpiId] = useState('')

  const loadAffiliate = async () => {
    setLoading(true)
    setError('')

    try {
      const [affiliateData, statsData, earningsData, payoutsData] =
        await Promise.all([
          getMyAffiliate(),
          getMyAffiliateStats(),
          getMyAffiliateEarnings(),
          getMyAffiliatePayouts(),
        ])

      setAffiliate(affiliateData || null)
      setStats(normalizeStats(statsData))
      setEarnings(normalizeList(earningsData))
      setPayouts(normalizeList(payoutsData))
    } catch (err) {
      setError(err?.message || 'Unable to load affiliate programme.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAffiliate()
  }, [])

  useEffect(() => {
    if (!success) return

    const timer = setTimeout(() => {
      setSuccess('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [success])

  const status = useMemo(() => getStatus(affiliate), [affiliate])

  const referralCode = useMemo(
    () => getReferralCode(affiliate),
    [affiliate]
  )

  const referralLink = useMemo(
    () => getReferralLink(affiliate),
    [affiliate]
  )

  const handleApply = async (event) => {
    event.preventDefault()

    if (!motivation.trim()) {
      setError('Please enter your motivation.')
      return
    }

    if (!channel) {
      setError('Please select your preferred channel.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const data = await applyAffiliate({
        motivation: motivation.trim(),
        channel,
      })

      setAffiliate(data || affiliate)
      setShowApplication(false)
      setMotivation('')
      setChannel('')
      setSuccess('Affiliate application submitted successfully.')
      await loadAffiliate()
    } catch (err) {
      setError(err?.message || 'Unable to submit your application.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async (value, type) => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(type)

      setTimeout(() => {
        setCopied('')
      }, 1800)
    } catch {
      setError('Unable to copy.')
    }
  }

  const handleShare = async () => {
    if (!referralLink) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on our Affiliate Programme',
          text: 'Use my referral link and start shopping.',
          url: referralLink,
        })
      } else {
        await handleCopy(referralLink, 'link')
      }
    } catch {
      return
    }
  }

  const handlePayout = async (event) => {
    event.preventDefault()

    const payoutAmount = Number(amount)

    if (!payoutAmount || payoutAmount <= 0) {
      setError('Please enter a valid payout amount.')
      return
    }

    if (payoutAmount > Number(stats.available || 0)) {
      setError('Payout amount cannot exceed your available balance.')
      return
    }

    if (!upiId.trim()) {
      setError('Please enter your UPI ID.')
      return
    }

    setPayoutSubmitting(true)
    setError('')

    try {
      await requestAffiliatePayout({
        amount: payoutAmount,
        upiId: upiId.trim(),
      })

      setAmount('')
      setUpiId('')
      setShowPayout(false)
      setSuccess('Payout request submitted successfully.')
      await loadAffiliate()
    } catch (err) {
      setError(err?.message || 'Unable to request payout.')
    } finally {
      setPayoutSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f7faf7] flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-[#315d32]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">
            Loading affiliate programme...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] bg-[#f7faf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 text-red-700">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 text-[#315d32]">
            <Check className="w-5 h-5 shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {!affiliate || !status ? (
          <JoinAffiliate
            onJoin={() => {
              setError('')
              setShowApplication(true)
            }}
          />
        ) : status === STATUS.PENDING ? (
          <PendingAffiliate />
        ) : status === STATUS.REJECTED ? (
          <RejectedAffiliate
            reason={
              affiliate?.rejectionReason ||
              affiliate?.reason ||
              'Your application was not approved.'
            }
            onApply={() => {
              setError('')
              setShowApplication(true)
            }}
          />
        ) : status === STATUS.SUSPENDED ? (
          <SuspendedAffiliate />
        ) : (
          <ApprovedAffiliate
            affiliate={affiliate}
            stats={stats}
            earnings={earnings}
            payouts={payouts}
            referralCode={referralCode}
            referralLink={referralLink}
            copied={copied}
            onCopy={handleCopy}
            onShare={handleShare}
            onPayout={() => {
              setError('')
              setShowPayout(true)
            }}
          />
        )}
      </div>

      {showApplication && (
        <ApplicationModal
          motivation={motivation}
          channel={channel}
          submitting={submitting}
          onMotivationChange={setMotivation}
          onChannelChange={setChannel}
          onClose={() => {
            if (!submitting) {
              setShowApplication(false)
            }
          }}
          onSubmit={handleApply}
        />
      )}

      {showPayout && (
        <PayoutModal
          amount={amount}
          upiId={upiId}
          available={stats.available}
          submitting={payoutSubmitting}
          onAmountChange={setAmount}
          onUpiChange={setUpiId}
          onClose={() => {
            if (!payoutSubmitting) {
              setShowPayout(false)
            }
          }}
          onSubmit={handlePayout}
        />
      )}
    </div>
  )
}

function JoinAffiliate({ onJoin }) {
  return (
    <section className="rounded-[28px] overflow-hidden bg-[#315d32] text-white">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-10 lg:p-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            AFFILIATE PROGRAMME
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Turn your recommendations into rewards.
          </h1>

          <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-white/80">
            Share products you love with your friends and community and earn
            rewards from eligible referred orders.
          </p>

          <button
            type="button"
            onClick={onJoin}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#315d32] transition hover:bg-[#f2f7ed]"
          >
            Join Affiliate Programme
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/5 p-7 sm:p-10 lg:p-12 grid gap-4 content-center">
          <BenefitCard
            icon={Users}
            title="Share"
            text="Share your personal referral link."
          />
          <BenefitCard
            icon={TrendingUp}
            title="Earn"
            text="Earn commission from eligible orders."
          />
          <BenefitCard
            icon={Wallet}
            title="Withdraw"
            text="Request payout from your available balance."
          />
        </div>
      </div>
    </section>
  )
}

function PendingAffiliate() {
  return (
    <section className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[28px] border border-[#e1e8df] p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Loader2 className="w-7 h-7" />
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-[#1f3322]">
          Application Under Review
        </h1>

        <p className="mt-3 text-sm sm:text-base leading-7 text-gray-500">
          Your affiliate application has been submitted successfully. Our team
          is reviewing your application.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-4 py-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Pending Review
        </div>
      </div>
    </section>
  )
}

function RejectedAffiliate({ reason, onApply }) {
  return (
    <section className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[28px] border border-[#e1e8df] p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <XCircle className="w-7 h-7" />
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-[#1f3322]">
          Application Not Approved
        </h1>

        <p className="mt-3 text-sm leading-7 text-gray-500">
          {reason}
        </p>

        <button
          type="button"
          onClick={onApply}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#315d32] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#264b28] transition"
        >
          Apply Again
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}

function SuspendedAffiliate() {
  return (
    <section className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[28px] border border-[#e1e8df] p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center">
          <XCircle className="w-7 h-7" />
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-[#1f3322]">
          Affiliate Account Suspended
        </h1>

        <p className="mt-3 text-sm sm:text-base leading-7 text-gray-500">
          Your affiliate account is currently suspended. Please contact
          support if you need more information.
        </p>
      </div>
    </section>
  )
}

function ApprovedAffiliate({
  affiliate,
  stats,
  earnings,
  payouts,
  referralCode,
  referralLink,
  copied,
  onCopy,
  onShare,
  onPayout,
}) {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
        <div>
          <div className="inline-flex items-center gap-2 text-[#315d32] text-xs font-semibold tracking-wide uppercase">
            <BadgeCheck className="w-4 h-4" />
            Affiliate Programme
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1f3322]">
            Your Affiliate Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track your referrals, earnings and payouts in one place.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start lg:self-auto rounded-full bg-green-50 text-[#315d32] px-4 py-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#315d32]" />
          Active Affiliate
        </div>
      </div>

      <ReferralCard
        referralCode={referralCode}
        referralLink={referralLink}
        copied={copied}
        onCopy={onCopy}
        onShare={onShare}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
        <StatCard
          icon={Users}
          label="Referrals"
          value={stats.referrals}
        />
        <StatCard
          icon={Clipboard}
          label="Orders"
          value={stats.orders}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={formatCurrency(stats.revenue)}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Earned"
          value={formatCurrency(stats.earned)}
        />
        <StatCard
          icon={Wallet}
          label="Available"
          value={formatCurrency(stats.available)}
        />
        <StatCard
          icon={Banknote}
          label="Pending Payout"
          value={formatCurrency(stats.pendingPayout)}
        />
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-5 mt-5">
        <EarningsCard earnings={earnings} />

        <PayoutCard
          available={stats.available}
          onPayout={onPayout}
        />
      </div>

      <PayoutHistory payouts={payouts} />
    </div>
  )
}

function ReferralCard({
  referralCode,
  referralLink,
  copied,
  onCopy,
  onShare,
}) {
  return (
    <section className="rounded-[24px] bg-white border border-[#e1e8df] shadow-sm p-5 sm:p-7">
      <div className="flex flex-col xl:flex-row xl:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[#315d32] text-xs font-semibold uppercase tracking-wide">
            <Gift className="w-4 h-4" />
            Your Referral
          </div>

          <h2 className="mt-2 text-xl font-semibold text-[#1f3322]">
            Share and start earning
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Use your referral code or share the referral link.
          </p>
        </div>

        <div className="w-full xl:max-w-[620px] grid sm:grid-cols-2 gap-3">
          <CopyBox
            label="Referral Code"
            value={referralCode || 'Not available'}
            copied={copied === 'code'}
            onCopy={() => onCopy(referralCode, 'code')}
          />

          <CopyBox
            label="Referral Link"
            value={referralLink || 'Not available'}
            copied={copied === 'link'}
            onCopy={() => onCopy(referralLink, 'link')}
          />
        </div>

        <button
          type="button"
          onClick={onShare}
          disabled={!referralLink}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315d32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#264b28] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </section>
  )
}

function CopyBox({ label, value, copied, onCopy }) {
  return (
    <div className="rounded-xl border border-[#e1e8df] bg-[#f8faf7] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#263c29]">
          {value}
        </span>

        <button
          type="button"
          onClick={onCopy}
          disabled={!value || value === 'Not available'}
          className="shrink-0 p-2 rounded-lg text-[#315d32] hover:bg-white transition disabled:opacity-40"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white border border-[#e1e8df] p-4 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-[#edf5e9] text-[#315d32] flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>

      <p className="mt-3 text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#1f3322] truncate">
        {value}
      </p>
    </div>
  )
}

function EarningsCard({ earnings }) {
  return (
    <section className="rounded-[24px] bg-white border border-[#e1e8df] shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-5 border-b border-[#edf1eb]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1f3322]">
              Earnings
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Your recent affiliate commissions
            </p>
          </div>

          <TrendingUp className="w-5 h-5 text-[#315d32]" />
        </div>
      </div>

      {earnings.length === 0 ? (
        <EmptyState
          icon={IndianRupee}
          title="No earnings yet"
          text="Your affiliate earnings will appear here."
        />
      ) : (
        <div className="divide-y divide-[#edf1eb]">
          {earnings.map((item, index) => (
            <EarningRow
              key={
                item?.id ||
                item?._id ||
                item?.orderId ||
                item?.referenceId ||
                index
              }
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function EarningRow({ item }) {
  const order =
    item?.orderNumber ||
    item?.orderNo ||
    item?.orderId ||
    item?.reference ||
    'Affiliate Order'

  const amount =
    item?.commission ??
    item?.amount ??
    item?.earned ??
    item?.commissionAmount ??
    0

  const status =
    item?.status ||
    item?.earningStatus ||
    'Pending'

  const date =
    item?.createdAt ||
    item?.date ||
    item?.createdDate ||
    null

  return (
    <div className="px-5 sm:px-6 py-4 flex items-center gap-4">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#edf5e9] text-[#315d32] flex items-center justify-center">
        <IndianRupee className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#263c29] truncate">
          {order}
        </p>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
          <span>{status}</span>
          {date && (
            <>
              <span>•</span>
              <span>{formatDate(date)}</span>
            </>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold text-[#315d32]">
        {formatCurrency(amount)}
      </p>
    </div>
  )
}

function PayoutCard({ available, onPayout }) {
  return (
    <section className="rounded-[24px] bg-[#315d32] text-white p-6">
      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
        <Wallet className="w-5 h-5" />
      </div>

      <p className="mt-6 text-sm text-white/70">
        Available for payout
      </p>

      <p className="mt-1 text-3xl font-semibold">
        {formatCurrency(available)}
      </p>

      <p className="mt-3 text-xs leading-5 text-white/70">
        Request a payout using your registered UPI ID.
      </p>

      <button
        type="button"
        onClick={onPayout}
        disabled={Number(available || 0) <= 0}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#315d32] hover:bg-[#f2f7ed] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Request Payout
        <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  )
}

function PayoutHistory({ payouts }) {
  return (
    <section className="mt-5 rounded-[24px] bg-white border border-[#e1e8df] shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-5 border-b border-[#edf1eb]">
        <h2 className="text-lg font-semibold text-[#1f3322]">
          Payout History
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Track your requested affiliate payouts
        </p>
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No payouts yet"
          text="Your payout requests will appear here."
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#fafcf9] border-b border-[#edf1eb]">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    UTR
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf1eb]">
                {payouts.map((item, index) => (
                  <PayoutRow
                    key={item?.id || item?._id || index}
                    item={item}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-[#edf1eb]">
            {payouts.map((item, index) => (
              <MobilePayoutRow
                key={item?.id || item?._id || index}
                item={item}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function PayoutRow({ item }) {
  const amount = item?.amount ?? item?.requestedAmount ?? 0
  const status = item?.status || 'PENDING'
  const date = item?.createdAt || item?.requestedAt || item?.date
  const utr = item?.utr || item?.utrNumber || item?.transactionReference || '-'

  return (
    <tr>
      <td className="px-6 py-4 text-sm font-semibold text-[#263c29]">
        {formatCurrency(amount)}
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={status} />
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        {date ? formatDate(date) : '-'}
      </td>

      <td className="px-6 py-4 text-sm font-mono text-gray-500">
        {utr}
      </td>
    </tr>
  )
}

function MobilePayoutRow({ item }) {
  const amount = item?.amount ?? item?.requestedAmount ?? 0
  const status = item?.status || 'PENDING'
  const date = item?.createdAt || item?.requestedAt || item?.date
  const utr = item?.utr || item?.utrNumber || item?.transactionReference || '-'

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-[#263c29]">
            {formatCurrency(amount)}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {date ? formatDate(date) : '-'}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 rounded-xl bg-[#f8faf7] p-3">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">
          UTR
        </p>
        <p className="mt-1 text-xs font-mono text-gray-600 break-all">
          {utr}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const value = String(status || 'PENDING').toUpperCase()

  const styles = {
    APPROVED: 'bg-green-50 text-green-700',
    PAID: 'bg-green-50 text-green-700',
    COMPLETED: 'bg-green-50 text-green-700',
    PENDING: 'bg-amber-50 text-amber-700',
    PROCESSING: 'bg-blue-50 text-blue-700',
    REJECTED: 'bg-red-50 text-red-700',
    FAILED: 'bg-red-50 text-red-700',
    SUSPENDED: 'bg-gray-100 text-gray-600',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        styles[value] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {value.replaceAll('_', ' ')}
    </span>
  )
}

function BenefitCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>

        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-white/65">{text}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-[#edf5e9] text-[#315d32] flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>

      <p className="mt-4 text-sm font-semibold text-[#263c29]">
        {title}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {text}
      </p>
    </div>
  )
}

function ApplicationModal({
  motivation,
  channel,
  submitting,
  onMotivationChange,
  onChannelChange,
  onClose,
  onSubmit,
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-lg rounded-[26px] bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#edf1eb] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1f3322]">
              Join Affiliate Programme
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Tell us a little about how you plan to share.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#263c29]">
              Why do you want to become an affiliate?
            </label>

            <textarea
              value={motivation}
              onChange={(event) => onMotivationChange(event.target.value)}
              rows={5}
              placeholder="Tell us about your audience and how you plan to promote products..."
              className="mt-2 w-full rounded-xl border border-[#dce5da] bg-white px-4 py-3 text-sm text-[#263c29] outline-none transition focus:border-[#315d32] focus:ring-2 focus:ring-[#315d32]/10 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#263c29]">
              Preferred channel
            </label>

            <div className="relative mt-2">
              <select
                value={channel}
                onChange={(event) => onChannelChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#dce5da] bg-white px-4 py-3 pr-10 text-sm text-[#263c29] outline-none transition focus:border-[#315d32] focus:ring-2 focus:ring-[#315d32]/10"
              >
                <option value="">Select channel</option>

                {CHANNELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-[#dce5da] px-5 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315d32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#264b28] transition disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}

function PayoutModal({
  amount,
  upiId,
  available,
  submitting,
  onAmountChange,
  onUpiChange,
  onClose,
  onSubmit,
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-md rounded-[26px] bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#edf1eb] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1f3322]">
              Request Payout
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Available balance: {formatCurrency(available)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#263c29]">
              Amount
            </label>

            <div className="relative mt-2">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="number"
                min="1"
                max={Number(available || 0)}
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-[#dce5da] bg-white pl-10 pr-4 py-3 text-sm text-[#263c29] outline-none transition focus:border-[#315d32] focus:ring-2 focus:ring-[#315d32]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#263c29]">
              UPI ID
            </label>

            <div className="relative mt-2">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={upiId}
                onChange={(event) => onUpiChange(event.target.value)}
                placeholder="example@upi"
                className="w-full rounded-xl border border-[#dce5da] bg-white pl-10 pr-4 py-3 text-sm text-[#263c29] outline-none transition focus:border-[#315d32] focus:ring-2 focus:ring-[#315d32]/10"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#f7faf7] border border-[#e4ebe1] px-4 py-3 text-xs text-gray-500">
            Your payout request will be reviewed before it is processed.
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-[#dce5da] px-5 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315d32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#264b28] transition disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {submitting ? 'Requesting...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      {children}
    </div>
  )
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return '-'
  }
}

export default Affiliate