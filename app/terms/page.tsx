import PolicyLayout from "../../components/PolicyLayout";

const TermsPage = () => (
  <PolicyLayout
    eyebrow="Policy"
    title="Terms"
    intro="By purchasing from Denylashes, you agree to provide accurate checkout details and use purchased products responsibly."
    sections={[
      {
        title: "Orders",
        body: "Orders are accepted when payment is confirmed through Stripe. Denylashes may contact you if extra information is needed to fulfil an order.",
      },
      {
        title: "Product information",
        body: "Product descriptions, prices, and availability can change. Denylashes aims to keep listings accurate and will correct errors when found.",
      },
      {
        title: "Support",
        body: "For order questions, product support, or access issues, use the contact page and include your order reference where possible.",
      },
    ]}
  />
);

export default TermsPage;
