"use client";

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface GuestCardData {
  guestName: string;
  memberName: string;
  huntDate: string;
  phoneNumber: string;
  huntType: string;
}

export default function GuestCardGenerator() {
  const [formData, setFormData] = useState<GuestCardData>({
    guestName: '',
    memberName: '',
    huntDate: '',
    phoneNumber: '',
    huntType: ''
  });
  const [issueDate] = useState(new Date().toISOString().split('T')[0]); // Auto-set to today
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof GuestCardData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send email with guest card info
      const response = await fetch('/api/guest-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          issueDate,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to send email:', result.error);
        // Still show the card even if email fails
      }
      
      setShowCard(true);
    } catch (error) {
      console.error('Error sending email:', error);
      // Still show the card even if email fails
      setShowCard(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        width: 525,
        height: 300,
      });
      
      const link = document.createElement('a');
      link.download = `guest-card-${formData.guestName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating card image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shareCard = async () => {
    if (!cardRef.current) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        width: 525,
        height: 300,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], `guest-card-${formData.guestName.replace(/\s+/g, '-')}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Guest Card',
              text: `Guest Card for ${formData.guestName}`
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          alert('Sharing is not supported on this device. Please use the download button instead.');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating card image. Please try again.');
      setLoading(false);
    }
  };

  const addToWallet = () => {
    // Generate vCard format that can be saved to contacts/wallet
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${formData.guestName}
TEL:${formData.phoneNumber}
ORG:Cromwell Fish & Game Club - Guest Pass
NOTE:Hunt Type: ${formData.huntType}\\nCost: ${getHuntCost(formData.huntType)}\\nHunt Date: ${new Date(formData.huntDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\\nIssue Date: ${new Date(issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\\nSponsored By: ${formData.memberName}\\n\\nThis card grants permission to bearer to hunt and fish on all land owned by the undersigned property owners.
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.guestName.replace(/\s+/g, '_')}_Guest_Card.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      guestName: '',
      memberName: '',
      huntDate: '',
      phoneNumber: '',
      huntType: ''
    });
    setShowCard(false);
  };

  const getHuntCost = (huntType: string): string => {
    if (huntType === 'Pheasant Hunt') return '$50';
    if (huntType === 'Opening Day of Duck') return '$100';
    return '';
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Cromwell Fish & Game Club
          </h1>
          <h2 className="text-xl sm:text-2xl text-gray-700">Guest Card Generator</h2>
        </div>

        {/* Form */}
        {!showCard ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={handleInputChange('guestName')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 text-gray-900"
                  placeholder="Enter guest's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={handleInputChange('memberName')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 text-gray-900"
                  placeholder="Enter member's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange('phoneNumber')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 text-gray-900"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Hunt <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.huntDate}
                  onChange={handleInputChange('huntDate')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Hunt <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.huntType}
                    onChange={handleInputChange('huntType')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select hunt type...</option>
                    <option value="Pheasant Hunt">Pheasant Hunt</option>
                    <option value="Opening Day of Duck">Opening Day of Duck</option>
                  </select>
                </div>

                {formData.huntType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost
                    </label>
                    <input
                      type="text"
                      value={getHuntCost(formData.huntType)}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-green-700 font-bold text-lg cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  'Generate Guest Card'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Guest Card Preview */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex justify-center">
                <div ref={cardRef} className="w-full max-w-[525px]" style={{ aspectRatio: '1.75/1' }}>
                  {/* Card Design - Business card size (3.5" x 2" at 150 DPI) */}
                  <div className="relative h-full bg-gradient-to-br from-green-50 to-white rounded-lg shadow-2xl overflow-hidden border-2 border-green-600">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-600 opacity-10 rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-green-600 opacity-10 rounded-tr-full"></div>
                    
                    <div className="relative h-full p-3 sm:p-4 flex flex-col">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-md px-3 py-2 sm:py-2 mb-2 sm:mb-2.5 shadow-md">
                        <h1 className="text-sm sm:text-base font-bold text-white text-center tracking-wide leading-tight">
                          CROMWELL FISH & GAME CLUB
                        </h1>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                          <div className="h-px w-4 sm:w-6 bg-white opacity-50"></div>
                          <p className="text-xs font-semibold text-white uppercase tracking-wider">Guest Pass</p>
                          <div className="h-px w-4 sm:w-6 bg-white opacity-50"></div>
                        </div>
                      </div>

                      {/* Guest Information - Compact layout */}
                      <div className="flex-1 space-y-1.5 sm:space-y-2">
                        {/* Primary Info - Guest & Phone */}
                        <div className="bg-white rounded-md p-2 sm:p-2 shadow-sm border border-green-100">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Guest</p>
                              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight break-words">{formData.guestName}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Phone</p>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">{formData.phoneNumber}</p>
                            </div>
                          </div>
                        </div>

                        {/* All Hunt Details in one card */}
                        <div className="bg-white rounded-md p-2 sm:p-2 shadow-sm border border-green-100">
                          <div className="grid grid-cols-2 gap-2 mb-1.5">
                            <div>
                              <p className="text-xs sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Sponsor</p>
                              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight break-words">{formData.memberName}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Cost</p>
                              <p className="text-sm sm:text-base font-bold text-green-600 leading-tight">{getHuntCost(formData.huntType)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-100">
                            <div>
                              <p className="text-xs sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Hunt Type</p>
                              <p className="text-xs sm:text-xs font-bold text-gray-900 leading-tight break-words">{formData.huntType}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Hunt Date</p>
                              <p className="text-xs sm:text-xs font-semibold text-gray-900 leading-tight">
                                {new Date(formData.huntDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer - Compact Terms */}
                      <div className="bg-green-50 rounded-md px-2 py-1.5 sm:mt-2 mt-1.5 border border-green-200">
                        <p className="text-xs sm:text-xs text-gray-700 text-center leading-snug">
                          Permission to hunt and fish on club property • Valid one day only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadCard}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Card</span>
                  </>
                )}
              </button>

              <button
                onClick={shareCard}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share Card</span>
                  </>
                )}
              </button>

              <button
                onClick={addToWallet}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Add to Wallet</span>
              </button>

              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Create Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

