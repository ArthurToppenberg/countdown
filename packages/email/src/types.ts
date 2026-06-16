export type SetPasswordEmailInput = {
  to: string;
  name: string;
  setPasswordUrl: string;
};

export type DagligEmailEventProps = {
  eventName: string;
  daysRemainingLabel: string;
};

export type DagligEmailSendInput = DagligEmailEventProps & {
  to: string;
  name: string;
};
