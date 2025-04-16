import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';

const LocationSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-8">
          {t('location.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Map */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.1272819661925!2d-6.768490823631771!3d34.02384277812917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76bdedcfe7897%3A0xf2456128ad63e8ac!2sSwibi%20collection!5e0!3m2!1sen!2sma!4v1713033915972!5m2!1sen!2sma"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            ></iframe>
          </div>
          
          {/* Store info & reviews */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-serif font-semibold mb-4">{t('location.storeInfo')}</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <span>Swibi Collection, Rabat, Morocco</span>
                </li>
                <li className="flex items-start">
                  <FaPhone className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <span>+212 600-000000</span>
                </li>
                <li className="flex items-start">
                  <FaClock className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p>{t('location.openHours')}</p>
                    <p>Monday - Saturday: 9:00 - 20:00</p>
                    <p>Sunday: Closed</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;