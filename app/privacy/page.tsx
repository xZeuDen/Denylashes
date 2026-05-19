import PolicyLayout from "../../components/PolicyLayout";

const PrivacyPage = () => (
  <PolicyLayout
    eyebrow="Policy"
    title="Privacy"
    intro="Denylashes only asks for the information needed to process orders, respond to messages, and manage customer support."
    sections={[
      {
        title: "Information collected",
        body: "Checkout collects contact, billing, and delivery information through Stripe. Contact and newsletter forms collect the details you submit.",
      },
      {
        title: "Payment data",
        body: "Card details are processed by Stripe. Denylashes does not store card numbers or security codes on this website.",
      },
      {
        title: "How data is used",
        body: "Order and contact information is used to fulfil purchases, respond to support requests, and maintain business records.",
      },
    ]}
  />
);

export default PrivacyPage;
