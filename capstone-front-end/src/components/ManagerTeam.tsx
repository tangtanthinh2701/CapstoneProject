const members = [
  {
    name: 'Nguyễn Văn A',
    title: 'Giám đốc Điều hành',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVPPXnypUPNr_YoiSoT0m5YGYSDFW_k-Dc_sl4F5v7Te0SohqDNq1Zl5eqHe7nhpFkLvNtYuKdBf-KDAmWhp0Q0V2rIlQYj0nmuH5ZvfnFQIz1S60ceAnRo-0sllrAe6AKQGzfHj8BRjcWoOgjEu874_pdFfy-f2_02CWXB4U506cojQcU6X3DvnpWGxGhQ8WZVS2buYst9x1omrAAYvGJZ2AegDPD-Ufe1lKAFdYRBLj7mDjti2W4CYT5sPy2A_Cudo7A9XjtQFjV',
  },
  {
    name: 'Trần Thị B',
    title: 'Giám đốc Công nghệ',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2wEO3yFkO65c1d7PpsZvXNV3rt6Nlj-JyIn9EZL0ibJU5iDqTFto6s5HvzuS5gePgptlB4tLJM0YqJJh8bJq4aGNlaGxaSFOmNDFg3LKmGunRQJhZc5PSRMruZW8HmeqCMOf1z80635czJxgSttAKJVNEuCeTERIe__Smr8BMYndvdg6q3X_g43JpQlZ4Y3ZS0bPdeA4nXh66P_Teuj5zjpXP9KYUIJflmw8zMs84MSogYpUfpA-CB1rJLC4Nx2QVHOpBiI0nkLRe',
  },
  {
    name: 'Lê Văn C',
    title: 'Trưởng phòng Phát triển',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3_d6oFfOoW9f9Uhy21QsbItq3NJJugGBiWbAI2ZhfAj95pLhDAU51M-znJljEmoFrAaJWAsFsRilQvct9Z2y9CqsExlI1k9G7jmtTNiUj750-VTI9hZKZ0isurlv57rPK_Rhx04vTyT3kfJo_UV6R-dvwWmNpknjUCrlcclgx9avB8cnJ7mX1-KZHjkwqrpdzA7dou_h1uB0REMcWYU3IqT7CTI9s77MHWXfkBPiVCDnvmO_ceVwQo25b0lIAJlvEHtUdyEd3vyTw',
  },
  {
    name: 'Phạm Thị D',
    title: 'Giám đốc Vận hành',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDuD6ZSyO6Kjga5MA60VWxXT_7rFFtFFgQtZboVYmOw2-oL4nF0M8vIIjiIA2iLDaQtIs9nnIlHOI99qFpyFb-3BfuPNkaiPesLzakQ2gAFufQN74NnJv0qqrA0iBq2S7HAz0DyFSg9O0VNIvFF4cxzyAt4jduJvfqFLEUtzvqP4ksMBeMtLUP1hBgA99TxAYiFGtJzrB10328uJGnOxLqs7NPRsqeAoCBSU9HE4bt0ODKjgMph1MkvOmHfPHROQr_1Um_yyU8AOFSW',
  },
];

export default function ManagerTeam() {
  return (
    <section className='px-10 py-16 text-center'>
      <h2 className='text-2xl font-bold mb-2'>Gặp gỡ Ban quản lý</h2>
      <p className='text-gray-400 mb-10 max-w-xl mx-auto'>
        Những chuyên gia tâm huyết dẫn dắt cách mạng hóa ngành công nghiệp oxy
        xanh.
      </p>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
        {members.map((m) => (
          <div key={m.name} className='text-center'>
            <img
              src={m.avatar}
              className='w-24 h-24 rounded-full mx-auto mb-3'
            />
            <h4 className='font-semibold'>{m.name}</h4>
            <p className='text-green-400 text-sm'>{m.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
