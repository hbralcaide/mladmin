import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Function to generate username and check availability
const generateUsername = async (firstName: string, lastName: string): Promise<string> => {
  // Base username: 'a' + first letter of firstname + lastname (all lowercase)
  const baseUsername = ('a' + firstName.charAt(0) + lastName).toLowerCase()
  
  // Check if base username exists
  const { data: existingUsers } = await supabase
    .from('admin_profiles')
    .select('username')
    .ilike('username', `${baseUsername}%`)
    .order('username', { ascending: true })

  if (!existingUsers?.length) {
    return baseUsername
  }

  // Find the highest number suffix
  const usernames = (existingUsers as { username: string }[]).map(u => u.username)
  let highestSuffix = 0

  usernames.forEach(username => {
    if (username === baseUsername) {
      highestSuffix = Math.max(highestSuffix, 1)
    } else {
      const suffix = parseInt(username.replace(baseUsername, '')) || 0
      highestSuffix = Math.max(highestSuffix, suffix)
    }
  })

  return `${baseUsername}${highestSuffix + 1}`
}

const Signup = () => {
  const navigate = useNavigate()
  const [emailValue, setEmailValue] = useState('')
  const [isVerifying, setIsVerifying] = useState(true)
  const [session, setSession] = useState<any>(null)
  
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (currentSession?.user?.email) {
          setEmailValue(currentSession.user.email)
          setSession(currentSession)
        } else {
          throw new Error('No valid session found')
        }
        setIsVerifying(false)
      } catch (error) {
        console.error('Error verifying invitation:', error)
        setIsVerifying(false)
        setError('Invalid or expired invitation. Please use the link from your email.')
      }
    }

    verifyInvitation()
  }, [])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate form data
    if (!emailValue) {
      setError('No email provided in invitation link')
      setLoading(false)
      return
    }

    if (!session) {
      setError('Invalid or expired session. Please use the link from your email.')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      // Generate username
      const username = await generateUsername(formData.firstName, formData.lastName)

      // Update the user's password and metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          username: username
        }
      })

      if (updateError) throw updateError

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      // Create admin profile
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([{
          auth_user_id: user.id,
          username: username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: emailValue,
          phone_number: formData.phoneNumber,
          role: 'admin',
          status: 'Active'
        }] as any)

      if (profileError) throw profileError

      navigate('/admin')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Verifying invitation...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Complete your profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username (auto-generated)
              </label>
              <div className="mt-1 block w-full p-2 rounded-md border border-gray-300 bg-gray-50">
                <span className="text-gray-900 font-medium">
                  {formData.firstName && formData.lastName ? 
                    `a${formData.firstName.charAt(0).toLowerCase()}${formData.lastName.toLowerCase()}` : 
                    'Please enter your name'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({...prev, phoneNumber: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 block w-full p-2 rounded-md border border-gray-300 bg-gray-50">
                <span className="text-gray-900 font-medium">
                  {emailValue || 'No email found. Please use the invitation link from your email.'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Creating account...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup