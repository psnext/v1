import { render } from '@testing-library/react';

import SummayWidget from './summay-widget';

describe('SummayWidget', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SummayWidget />);
    expect(baseElement).toBeTruthy();
  });
});
