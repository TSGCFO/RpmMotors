import { useState, useRef } from 'react';

export default function UTMGenerator() {
  const [utmParams, setUtmParams] = useState({
    url: 'https://rpmauto.com',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  });
  
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUtmParams(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate UTM link
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = new URL(utmParams.url);
    
    // Add UTM parameters if they have values
    if (utmParams.source) url.searchParams.set('utm_source', utmParams.source);
    if (utmParams.medium) url.searchParams.set('utm_medium', utmParams.medium);
    if (utmParams.campaign) url.searchParams.set('utm_campaign', utmParams.campaign);
    if (utmParams.term) url.searchParams.set('utm_term', utmParams.term);
    if (utmParams.content) url.searchParams.set('utm_content', utmParams.content);
    
    setGeneratedUrl(url.toString());
    setCopied(false);
  };
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (!linkRef.current) return;
    
    linkRef.current.select();
    document.execCommand('copy');
    setCopied(true);
    
    // Reset copied status after 3 seconds
    setTimeout(() => setCopied(false), 3000);
  };
  
  // Common UTM sources
  const commonSources = [
    { value: '', label: 'Select a source' },
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email', label: 'Email' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'direct', label: 'Direct' }
  ];
  
  // Common UTM mediums
  const commonMediums = [
    { value: '', label: 'Select a medium' },
    { value: 'cpc', label: 'CPC (Cost Per Click)' },
    { value: 'organic', label: 'Organic' },
    { value: 'social', label: 'Social' },
    { value: 'email', label: 'Email' },
    { value: 'display', label: 'Display' },
    { value: 'referral', label: 'Referral' },
    { value: 'banner', label: 'Banner' }
  ];
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-['Poppins'] font-semibold mb-6">UTM Link Generator</h2>
      
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Base URL */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            Base URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={utmParams.url}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
            placeholder="e.g. https://rpmauto.com"
            required
          />
          <p className="text-sm text-gray-500 mt-1">The destination URL for your marketing campaign.</p>
        </div>
        
        {/* UTM Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium mb-2">
            UTM Source <span className="text-red-500">*</span>
          </label>
          <select
            id="source"
            name="source"
            value={utmParams.source}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
            required
          >
            {commonSources.map(source => (
              <option key={source.value} value={source.value}>{source.label}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Identifies which site sent the traffic (e.g. google, facebook).</p>
        </div>
        
        {/* UTM Medium */}
        <div>
          <label htmlFor="medium" className="block text-sm font-medium mb-2">
            UTM Medium <span className="text-red-500">*</span>
          </label>
          <select
            id="medium"
            name="medium"
            value={utmParams.medium}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
            required
          >
            {commonMediums.map(medium => (
              <option key={medium.value} value={medium.value}>{medium.label}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Identifies the type of link used (e.g. cpc, banner, email).</p>
        </div>
        
        {/* UTM Campaign */}
        <div>
          <label htmlFor="campaign" className="block text-sm font-medium mb-2">
            UTM Campaign <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="campaign"
            name="campaign"
            value={utmParams.campaign}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
            placeholder="e.g. summer_sale_2025"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Identifies a specific product promotion or strategic campaign.</p>
        </div>
        
        {/* Optional Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UTM Term */}
          <div>
            <label htmlFor="term" className="block text-sm font-medium mb-2">
              UTM Term <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="term"
              name="term"
              value={utmParams.term}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
              placeholder="e.g. luxury_cars"
            />
            <p className="text-sm text-gray-500 mt-1">Identifies paid search keywords.</p>
          </div>
          
          {/* UTM Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              UTM Content <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="content"
              name="content"
              value={utmParams.content}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
              placeholder="e.g. banner_top"
            />
            <p className="text-sm text-gray-500 mt-1">Identifies what specifically was clicked to bring the user.</p>
          </div>
        </div>
        
        {/* Generate Button */}
        <button
          type="submit"
          className="py-3 px-6 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
        >
          Generate UTM Link
        </button>
      </form>
      
      {/* Generated URL */}
      {generatedUrl && (
        <div className="mt-8 p-6 bg-[#F5F5F5] rounded-lg">
          <h3 className="text-lg font-['Poppins'] font-semibold mb-4">Generated URL</h3>
          <div className="flex">
            <input
              ref={linkRef}
              type="text"
              readOnly
              value={generatedUrl}
              className="flex-grow p-3 border border-gray-300 bg-white rounded-l focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-[#E31837] text-white rounded-r hover:bg-opacity-90 transition"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Use this URL in your marketing campaigns to track their effectiveness.
            When users click this link, the UTM parameters will be tracked in your analytics.
          </p>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-[#F5F5F5] rounded-lg">
        <h3 className="text-lg font-['Poppins'] font-semibold mb-4">About UTM Parameters</h3>
        <p className="text-gray-600 mb-4">
          UTM parameters are tags added to the end of a URL that help you track the effectiveness of your marketing campaigns.
          They allow you to identify which sources, mediums, and specific campaigns are driving traffic to your website.
        </p>
        
        <h4 className="font-['Poppins'] font-semibold mt-4 mb-2">Benefits of UTM Tracking:</h4>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Understand which marketing channels drive the most traffic</li>
          <li>Identify which campaigns result in the most inquiries or sales</li>
          <li>Calculate the ROI of different marketing efforts</li>
          <li>Make data-driven decisions for future marketing investments</li>
        </ul>
      </div>
    </div>
  );
}