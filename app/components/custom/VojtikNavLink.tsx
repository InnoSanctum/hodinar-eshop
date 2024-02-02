import React, {useContext} from 'react';
import {Link,NavLink} from '@remix-run/react';
import { RemixLinkProps} from '@remix-run/react/dist/components';
import {VojtikContext} from './VojtikContext';

export default function VojtikNavLink(
  props: RemixLinkProps & React.RefAttributes<HTMLAnchorElement>,
) {
  const context = useContext(VojtikContext);

  return (
    <NavLink
      {...props}
      to={props.to && `${context.language.pathPrefix}${props.to}`}
    >
      {props.children}
    </NavLink>
  );
}