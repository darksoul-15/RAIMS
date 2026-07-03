import { requestStatusClass, humanizeStatus } from '../../utils/statusColors';

const RequestStatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${requestStatusClass(status)}`}
  >
    {humanizeStatus(status)}
  </span>
);

export default RequestStatusBadge;
