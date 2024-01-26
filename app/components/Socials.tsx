import React from 'react';
import instagram from '../../public/assets/svgs/instagram.svg';
import facebook from '../../public/assets/svgs/facebook.svg';
import linkedin from '../../public/assets/svgs/linkedin.svg';
import pinterest from '../../public/assets/svgs/pinterest.svg';
import tiktok from '../../public/assets/svgs/tiktok.svg';
import youtube from '../../public/assets/svgs/youtube.svg';

export default function Socials() {
  const socials: {url: string; icon: string}[] = [
    {url: 'https://www.instagram.com/atelier_pryimak', icon: instagram},
    {url: 'https://www.facebook.com/atelier.pryimak/', icon: facebook},
    {
      url: 'https://www.linkedin.com/in/ateli%C3%A9r-pryimak-2504992a6?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3Bupu8k%2FCVQpe%2FLaQkhWtdFg%3D%3D',
      icon: linkedin,
    },
    {url: 'https://www.tiktok.com/@atelierpryimak', icon: tiktok},
    {url: 'https://pin.it/TLGCJC9', icon: pinterest},
    {url: 'https://www.youtube.com/@Atelier_Pryimak', icon: youtube},
  ];
  return (
    <ul className="flex flex-wrap gap-4 h-6">
      {socials.map((item, i) => {
        return (
          <li key={i}>
            <a href={item.url} target="_blank">
              <img src={item.icon} loading="lazy" className="h-6" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
