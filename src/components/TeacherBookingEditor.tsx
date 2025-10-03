import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Save, Eye, Link, Video, User, Globe, Tag, MessageSquare, X, Plus, Calendar, Clock, Settings, Info, Mail, Lock, EyeOff } from 'lucide-react';
import { db, auth } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  bookingPageTitle: string;
  description: string;
  languages: string[];
  specialties: string[];
  meetingRoom: 'google-meet' | 'zoom' | 'other';
  customMeetingRoom?: string;
  customLink: string;
  autoLink: string;
  useCustomLink: boolean;
  avatar?: string;
}

const TeacherBookingEditor: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab') as 'info' | 'schedule' | 'profile' | null;
  
  const [activeSection, setActiveSection] = useState<'info' | 'schedule' | 'profile'>(tabParam || 'info');
  const [profile, setProfile] = useState<TeacherProfile>({
    id: currentUser?.id || '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bookingPageTitle: currentUser?.name || 'Korean Lesson',
    description: 'Native Korean speaker with 5+ years of teaching experience. I specialize in conversational Korean and help students build confidence in speaking.',
    languages: ['Korean', 'English'],
    specialties: ['Conversational Korean', 'Business Korean', 'TOPIK Preparation'],
    meetingRoom: 'google-meet',
    customMeetingRoom: '',
    customLink: '',
    autoLink: `${window.location.origin}/teacher/${currentUser?.id}/book`,
    useCustomLink: false,
  });

  // Schedule/Availability state
  const [classTitle, setClassTitle] = useState('Korean Lesson');
  const [classDuration, setClassDuration] = useState(50);
  const [breakDuration, setBreakDuration] = useState(10);
  const [classPrice, setClassPrice] = useState(20);
  const [currency, setCurrency] = useState('USD');
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [availability, setAvailability] = useState({
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [],
    sunday: [],
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile/Password state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update active section when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab') as 'info' | 'schedule' | 'profile' | null;
    if (tabParam) {
      setActiveSection(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        autoLink: `${window.location.origin}/teacher/${currentUser.id}/book`,
        customLink: prev.customLink || `korean-lessons-${currentUser.name?.toLowerCase().replace(/\s+/g, '-')}`
      }));

      // Load saved settings from Firebase
      const loadSettings = async () => {
        if (!db) return;

        try {
          const teacherSettingsRef = doc(db, 'teacherSettings', currentUser.id);
          const settingsDoc = await getDoc(teacherSettingsRef);

          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            setProfile(prev => ({
              ...prev,
              ...data,
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            }));
            
                    if (data.classTitle) setClassTitle(data.classTitle);
                    if (data.classDuration) setClassDuration(data.classDuration);
                    if (data.breakDuration !== undefined) setBreakDuration(data.breakDuration);
                    if (data.classPrice !== undefined) setClassPrice(data.classPrice);
                    if (data.currency) setCurrency(data.currency);
                    if (data.repeatWeekly !== undefined) setRepeatWeekly(data.repeatWeekly);
                    if (data.availability) setAvailability(data.availability);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      };

      loadSettings();
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    
    try {
      if (!db) {
        // Mock save if Firebase is disabled
        setTimeout(() => {
          setSaving(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }, 1000);
        return;
      }

      // Save to Firebase
      const teacherSettingsRef = doc(db, 'teacherSettings', currentUser.id);
              await setDoc(teacherSettingsRef, {
                ...profile,
                bookingLink: getBookingLink(), // Save the actual booking link
                classTitle,
                classDuration,
                breakDuration,
                classPrice,
                currency,
                repeatWeekly,
                availability,
                updatedAt: new Date()
              });

      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaving(false);
      alert('Failed to save profile. Please try again.');
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const generateCustomLink = () => {
    const baseUrl = window.location.origin;
    const customSlug = profile.customLink.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `${baseUrl}/book/${customSlug}`;
  };

  const getBookingLink = () => {
    if (profile.useCustomLink && profile.customLink) {
      return generateCustomLink();
    }
    return profile.autoLink;
  };

  // Availability management functions
  const addTimeSlot = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...prev[day as keyof typeof prev], { start: '09:00', end: '17:00' }]
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day as keyof typeof prev].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day as keyof typeof prev].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleDayAvailability = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day as keyof typeof prev].length > 0 ? [] : [{ start: '09:00', end: '17:00' }]
    }));
  };

  // Debounced password match validation
  useEffect(() => {
    if (confirmPassword && newPassword) {
      setShowPasswordMatch(false);
      const timer = setTimeout(() => {
        setShowPasswordMatch(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowPasswordMatch(false);
    }
  }, [confirmPassword, newPassword]);

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      if (!auth || !auth.currentUser || !currentUser) {
        setPasswordError('Not authenticated');
        setPasswordLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Please log out and log back in before changing your password');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isGoogleUser = currentUser?.email?.includes('google') || false;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Your Booking Page</h1>
          <p className="text-xl text-gray-600">
            Customize how students see your booking page and manage your availability
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="py-4 px-3">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSection('info')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeSection === 'info'
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Info className="h-5 w-5" />
                    <span>Basic Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('schedule')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeSection === 'schedule'
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Schedule & Availability</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('profile')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeSection === 'profile'
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeSection === 'info' ? (
              <div className="space-y-6">
            
            {/* Basic Information */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3 text-primary-600" />
                  Basic Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Page Title
                    </label>
                    <input
                      type="text"
                      value={profile.bookingPageTitle}
                      onChange={(e) => setProfile(prev => ({ ...prev, bookingPageTitle: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Hailey's Korean Lessons"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This will appear as the main title on your booking page
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={profile.description}
                      onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="input-field"
                      placeholder="Tell students about your teaching experience and style..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Help students understand your teaching approach and experience
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Globe className="h-6 w-6 mr-3 text-primary-600" />
                  Languages
                </h2>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {language}
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      className="input-field flex-1"
                      placeholder="Add a language (e.g., Korean, English, Japanese)"
                    />
                    <button
                      onClick={addLanguage}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Tag className="h-6 w-6 mr-3 text-primary-600" />
                  Specialties
                </h2>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800"
                      >
                        {specialty}
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-2 text-secondary-600 hover:text-secondary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      className="input-field flex-1"
                      placeholder="Add a specialty (e.g., Conversational Korean, Business Korean)"
                    />
                    <button
                      onClick={addSpecialty}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Room Settings */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Video className="h-6 w-6 mr-3 text-primary-600" />
                  Meeting Room Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose your meeting platform
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="meetingRoom"
                          value="google-meet"
                          checked={profile.meetingRoom === 'google-meet'}
                          onChange={(e) => setProfile(prev => ({ ...prev, meetingRoom: e.target.value as any }))}
                          className="mr-3"
                        />
                        <span className="text-gray-700">Google Meet (Recommended)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="meetingRoom"
                          value="zoom"
                          checked={profile.meetingRoom === 'zoom'}
                          onChange={(e) => setProfile(prev => ({ ...prev, meetingRoom: e.target.value as any }))}
                          className="mr-3"
                        />
                        <span className="text-gray-700">Zoom</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="meetingRoom"
                          value="other"
                          checked={profile.meetingRoom === 'other'}
                          onChange={(e) => setProfile(prev => ({ ...prev, meetingRoom: e.target.value as any }))}
                          className="mr-3"
                        />
                        <span className="text-gray-700">Other (Custom URL)</span>
                      </label>
                    </div>
                  </div>

                  {profile.meetingRoom === 'other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Meeting Room URL
                      </label>
                      <input
                        type="url"
                        value={profile.customMeetingRoom || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, customMeetingRoom: e.target.value }))}
                        className="input-field"
                        placeholder="https://zoom.us/j/123456789"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Link Settings */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Link className="h-6 w-6 mr-3 text-primary-600" />
                  Link Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={profile.useCustomLink}
                        onChange={(e) => setProfile(prev => ({ ...prev, useCustomLink: e.target.checked }))}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Use custom link instead of auto-generated link
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Generated Link
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
                      <code className="text-sm text-gray-700 break-all">{profile.autoLink}</code>
                    </div>
                  </div>

                  {profile.useCustomLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Link Slug
                      </label>
                      <input
                        type="text"
                        value={profile.customLink}
                        onChange={(e) => setProfile(prev => ({ ...prev, customLink: e.target.value }))}
                        className="input-field"
                        placeholder="korean-lessons-hailey"
                      />
                      <p className="text-sm text-gray-500 mt-1 break-all">
                        Your custom link will be: {generateCustomLink()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`btn-primary flex items-center space-x-2 ${
                      saved ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            ) : activeSection === 'schedule' ? (
              <div className="space-y-6">
                {/* Class Settings */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Clock className="h-6 w-6 mr-3 text-primary-600" />
                      Class Settings
                    </h2>
                    
                    {/* Row 1: Class Title (full width) */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Title
                      </label>
                      <input
                        type="text"
                        value={classTitle}
                        onChange={(e) => setClassTitle(e.target.value)}
                        className="input-field"
                        placeholder="e.g., Korean Conversation Lesson"
                      />
                    </div>

                    {/* Row 2: Currency + Price per Lesson */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="input-field"
                        >
                          <option value="USD">🇺🇸 USD ($)</option>
                          <option value="EUR">🇪🇺 EUR (€)</option>
                          <option value="GBP">🇬🇧 GBP (£)</option>
                          <option value="JPY">🇯🇵 JPY (¥)</option>
                          <option value="KRW">🇰🇷 KRW (₩)</option>
                          <option value="CNY">🇨🇳 CNY (¥)</option>
                          <option value="AUD">🇦🇺 AUD ($)</option>
                          <option value="CAD">🇨🇦 CAD ($)</option>
                          <option value="CHF">🇨🇭 CHF (Fr)</option>
                          <option value="INR">🇮🇳 INR (₹)</option>
                          <option value="SGD">🇸🇬 SGD ($)</option>
                          <option value="HKD">🇭🇰 HKD ($)</option>
                          <option value="NZD">🇳🇿 NZD ($)</option>
                          <option value="SEK">🇸🇪 SEK (kr)</option>
                          <option value="NOK">🇳🇴 NOK (kr)</option>
                          <option value="DKK">🇩🇰 DKK (kr)</option>
                          <option value="MXN">🇲🇽 MXN ($)</option>
                          <option value="BRL">🇧🇷 BRL (R$)</option>
                          <option value="AED">🇦🇪 AED (د.إ)</option>
                          <option value="THB">🇹🇭 THB (฿)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Lesson
                        </label>
                        <input
                          type="number"
                          value={classPrice}
                          onChange={(e) => setClassPrice(Number(e.target.value))}
                          className="input-field"
                          min="1"
                          step="1"
                          placeholder="e.g., 20"
                        />
                      </div>
                    </div>

                    {/* Row 3: Class Duration + Break Between Lessons */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Duration (minutes)
                        </label>
                        <select
                          value={classDuration}
                          onChange={(e) => setClassDuration(Number(e.target.value))}
                          className="input-field"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={50}>50 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Break Between Lessons (minutes)
                        </label>
                        <select
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          className="input-field"
                        >
                          <option value={0}>No break</option>
                          <option value={5}>5 minutes</option>
                          <option value={10}>10 minutes</option>
                          <option value={15}>15 minutes</option>
                          <option value={20}>20 minutes</option>
                          <option value={30}>30 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Availability */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calendar className="h-6 w-6 mr-3 text-primary-600" />
                      General Availability
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="repeatWeekly"
                            checked={repeatWeekly}
                            onChange={(e) => setRepeatWeekly(e.target.checked)}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor="repeatWeekly" className="text-lg font-medium text-gray-900 cursor-pointer">
                            Repeat weekly
                          </label>
                        </div>
                        <span className="text-sm text-gray-600">Set your regular schedule</span>
                      </div>
                      
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const timeSlots = availability[day as keyof typeof availability];
                        return (
                        <div key={day} className="flex items-start space-x-6 p-4 bg-gray-50 rounded-lg">
                          <div className="w-24 flex-shrink-0">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={timeSlots.length > 0}
                                onChange={() => toggleDayAvailability(day)}
                                className="mr-3"
                              />
                              <span className="font-medium capitalize">{day}</span>
                            </label>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {timeSlots.length > 0 ? (
                              <div className="space-y-3">
                                {timeSlots.map((slot, index) => (
                                  <div key={index} className="flex items-center space-x-3">
                                    <input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                                      className="input-field text-sm w-32"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                                      className="input-field text-sm w-32"
                                    />
                                    <button
                                      onClick={() => removeTimeSlot(day, index)}
                                      className="p-1 text-red-500 hover:text-red-700 flex-shrink-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addTimeSlot(day)}
                                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Add time slot</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleDayAvailability(day)}
                                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Add availability</span>
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`btn-primary flex items-center space-x-2 ${
                      saved ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Schedule'}</span>
                  </button>
                </div>
              </div>
            ) : activeSection === 'profile' ? (
              <div className="space-y-6">
                {/* Account Information Card */}
                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-6">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          👨‍🏫 Teacher
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Email */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">Email Address</p>
                          <p className="text-gray-900 font-medium">{currentUser?.email}</p>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      {currentUser?.dateOfBirth && (
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                            <p className="text-gray-900 font-medium">
                              {new Date(currentUser.dateOfBirth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Member Since */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">Member Since</p>
                          <p className="text-gray-900 font-medium">{formatDate(currentUser?.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Card */}
                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-6 w-6 text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Password & Security</h2>
                      </div>
                      {!isGoogleUser && !isEditingPassword && (
                        <button onClick={() => setIsEditingPassword(true)} className="btn-secondary">
                          Change Password
                        </button>
                      )}
                    </div>

                    {isGoogleUser ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          <strong>Google Account:</strong> You signed in with Google. Password management is handled through your Google account.
                        </p>
                      </div>
                    ) : isEditingPassword ? (
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        {passwordError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                            {passwordSuccess}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password *
                          </label>
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password *
                          </label>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field"
                            minLength={6}
                            required
                          />
                          <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password *
                          </label>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`input-field ${
                              showPasswordMatch && confirmPassword && newPassword && confirmPassword !== newPassword
                                ? 'border-red-300'
                                : ''
                            }`}
                            minLength={6}
                            required
                          />
                          {showPasswordMatch && confirmPassword && newPassword && (
                            <div className="mt-2">
                              {confirmPassword === newPassword ? (
                                <p className="text-sm text-green-600">✓ Passwords match!</p>
                              ) : (
                                <p className="text-sm text-red-600">✗ Passwords do not match</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="btn-primary disabled:opacity-50"
                          >
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingPassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordError('');
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700"><strong>Password:</strong> ••••••••</p>
                        <p className="text-sm text-gray-600 mt-2">Last updated: {formatDate(currentUser?.createdAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card">
                <div className="py-4 px-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-primary-600" />
                    Preview
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {profile.bookingPageTitle}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {profile.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {profile.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {profile.specialties.map((specialty, index) => (
                          <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {activeSection === 'schedule' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Class Settings</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Title:</strong> {classTitle}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Duration:</strong> {classDuration} minutes

                        </p>
                        
                        <h5 className="font-medium text-gray-900 mb-2">Weekly Availability</h5>
                        <div className="space-y-1">
                          {Object.entries(availability).map(([day, timeSlots]) => (
                            <div key={day} className="text-xs">
                              <span className="font-medium capitalize">{day}:</span>
                              {timeSlots.length > 0 ? (
                                <div className="ml-2">
                                  {timeSlots.map((slot, index) => (
                                    <div key={index} className="text-gray-600">
                                      {slot.start} - {slot.end}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 ml-1">Unavailable</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <a
                      href={getBookingLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview Booking Page</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherBookingEditor;

