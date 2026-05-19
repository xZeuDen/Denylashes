import PolicyLayout from "../../components/PolicyLayout";

const ShippingPage = () => (
  <PolicyLayout
    eyebrow="Customer care"
    title="Shipping"
    intro="Denylashes prepares physical orders with tracked delivery and sends digital purchases by email after payment confirmation."
    sections={[
      {
        title: "Processing",
        body: "Physical products are normally prepared within 1 to 3 business days. During launches or busy periods, preparation can take a little longer.",
      },
      {
        title: "Delivery",
        body: "Checkout currently supports Ireland and the United Kingdom. Launch orders use free tracked delivery unless a different delivery option is shown at checkout.",
      },
      {
        title: "Digital products",
        body: "Courses, guides, and other digital products are delivered by email after payment is confirmed. Contact support if access does not arrive after checkout.",
      },
    ]}
  />
);

export default ShippingPage;
