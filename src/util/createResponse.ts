type createResponseProps = {
  message: string;
  status: number;
  ok?: boolean;
  statusText?: string;
  redirected?: boolean;
  data?: any;
};

const createResponse = ({
  message,
  status,
  ok = true,
  statusText = "",
  redirected = false,
  data = null,
  ...args
}: createResponseProps) => {
  return { message, status, ok, statusText, redirected, data, ...args };
};
export default createResponse;
