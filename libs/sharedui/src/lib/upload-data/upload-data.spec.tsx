import { render } from '@testing-library/react';

import UploadData from './upload-data';

describe('UploadData', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UploadData />);
    expect(baseElement).toBeTruthy();
  });
});
