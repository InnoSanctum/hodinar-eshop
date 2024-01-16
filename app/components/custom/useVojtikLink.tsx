import {useContext} from 'react';
import {VojtikContext} from './VojtikContext';

export default function useVojtikLink(text: string) {
  const context = useContext(VojtikContext);
  return `${context.language.pathPrefix}${text}`;
}