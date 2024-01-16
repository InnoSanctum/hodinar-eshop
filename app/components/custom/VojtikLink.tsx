import React, {useContext} from 'react';
import {Link} from '@remix-run/react';
import {RemixLinkProps} from '@remix-run/react/dist/components';
import {VojtikContext} from './VojtikContext';

export default function VojtikLink(
  props: RemixLinkProps & React.RefAttributes<HTMLAnchorElement>,
) {
  const context = useContext(VojtikContext);

  return (
    <Link      {...props}
      to={props.to && `${context.language.pathPrefix}${props.to}`}
    >
      {props.children}
    </Link>
  );
}
