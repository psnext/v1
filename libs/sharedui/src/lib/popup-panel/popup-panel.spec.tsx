import { render } from '@testing-library/react';

import PopupPanel from './popup-panel';

describe('PopupPanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PopupPanel />);
    expect(baseElement).toBeTruthy();
  });
});
