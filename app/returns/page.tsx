import PolicyLayout from "../../components/PolicyLayout";

const ReturnsPage = () => (
  <PolicyLayout
    eyebrow="Customer care"
    title="Returns"
    intro="If something is not right with your order, contact Denylashes with your order reference and the email used at checkout."
    sections={[
      {
        title: "Physical products",
        body: "Unopened and unused physical products can be reviewed for return support within 14 days of delivery. Items must be in their original packaging.",
      },
      {
        title: "Damaged or incorrect items",
        body: "If an item arrives damaged or incorrect, contact support within 48 hours of delivery with photos and your order details so it can be resolved quickly.",
      },
      {
        title: "Digital products",
        body: "Digital products are generally not returnable once access has been delivered, unless required by applicable consumer law.",
      },
    ]}
  />
);

export default ReturnsPage;
