import { useState, useEffect } from 'react';

export const useIPAddress = () => {
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const getIPAddress = async () => {
      try {
        const services = [
          'https://api.ipify.org?format=json',
          'https://api64.ipify.org?format=json',
          'https://ipapi.co/json/'
        ];

        for (const service of services) {
          try {
            const response = await fetch(service);
            if (response.ok) {
              const data = await response.json();
              setIpAddress(data.ip || data.ip);
              return;
            }
          } catch (error) {
            continue;
          }
        }
        setIpAddress('Unable to fetch IP');
      } catch (error) {
        setIpAddress('Error fetching IP');
      }
    };

    getIPAddress();
  }, []);

  return ipAddress;
};