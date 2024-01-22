import React, {useContext} from 'react';
import {Link} from '@remix-run/react';
import {RemixLinkProps} from '@remix-run/react/dist/components';
import {VojtikContext} from './VojtikContext';

export default function VojtikLink(
  props: RemixLinkProps & React.RefAttributes<HTMLAnchorElement>,
) {
  const context = useContext(VojtikContext);

  return (
    <Link
      {...props}
      to={props.to && `${context.language.pathPrefix}${props.to}`}
    >
      {props.children}
    </Link>
  );
}

// import {
//   Link as RemixLink,
//   NavLink as RemixNavLink,
//   useMatches,
// } from '@remix-run/react';
// import {usePrefixPathWithLocale} from '../../utils';
// export default function VojtikLink(props) {
//   const {to, className, ...resOfProps} = props;
//   const root = useMatches()
//   console.log("root",root)
//   return null
//   const selectedLocale = root.data.selectedLocale;

//   let toWithLocale = to;

//   if (typeof to === 'string') {
//     toWithLocale = selectedLocale ? `${selectedLocale.pathPrefix}${to}` : to;
//   }

//   if (typeof className === 'function') {
//     return (
//       <RemixNavLink to={toWithLocale} className={className} {...resOfProps} />
//     );
//   }

//   return <RemixLink to={toWithLocale} className={className} {...resOfProps} />;
// }
// /* export function usePrefixPathWithLocale(path:string) {
//   const [root] = useMatches();
//   const selectedLocale = root.data.selectedLocale;

//   return selectedLocale
//     ? `${selectedLocale.pathPrefix}${path.startsWith('/') ? path : '/' + path}`
//     : path;
// }
//  */