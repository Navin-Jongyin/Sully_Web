import { useEffect, useState } from 'react'
import { fetchCloudApplicants, subscribeApplicants } from '../firebase'
import { normalizeEmail } from '../lib/dates'
import type { Applicant } from '../types'

export function useApplicants() {
  const [applicantsByEmail, setApplicantsByEmail] = useState<Record<string, Applicant>>({})
  const [loaded, setLoaded] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    const setRegistered = (applicants: Applicant[]) => {
      const map: Record<string, Applicant> = {}
      applicants.forEach((applicant) => {
        const email = normalizeEmail(applicant?.email || '')
        if (email) map[email] = applicant
      })
      setApplicantsByEmail(map)
      setLoaded(true)
      setLoadFailed(false)
    }

    fetchCloudApplicants()
      .then(setRegistered)
      .catch((err) => {
        console.error('Could not load applicants', err)
        setLoadFailed(true)
        setLoaded(false)
      })

    const unsub = subscribeApplicants(setRegistered)
    return unsub
  }, [])

  return { applicantsByEmail, loaded, loadFailed }
}
