<script lang="ts">
    let email = '';
    let responseMessage = '';
  
    async function sendVerificationEmail() {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
      responseMessage = data.message;
    }
  </script>
  
  <div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">회원가입</h2>
  
    <label class="block mb-2 text-gray-700">이메일</label>
    <input
      type="email"
      bind:value={email}
      class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
      placeholder="이메일 입력"
    />
  
    <button
      on:click={sendVerificationEmail}
      class="w-full mt-6 bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300"
    >
      이메일 인증 요청
    </button>
  
    <p class="mt-4 text-center text-sm text-gray-500">{responseMessage}</p>
  </div>
  