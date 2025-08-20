
// 'use client';

// import { useState } from 'react';

// export default function AddWarehousePage() {
//   const [name, setName] = useState('');
//   const [pincodes, setPincodes] = useState(['', '', '', '', '']);
//   const [manager, setManager] = useState({ username: '', email: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (index: number, value: string) => {
//     const updated = [...pincodes];
//     updated[index] = value;
//     setPincodes(updated);
//   };

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     const res = await fetch('/api/manager/makeWarehouse/', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, pincodes, manager }),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       setMessage('Warehouse created successfully!');
//       setName('');
//       setPincodes(['', '', '', '', '']);
//       setManager({ username: '', email: '', password: '' });
//     } else {
//       setMessage(data.error || 'Something went wrong');
//     }
//   };

//   return (
//     <div className="p-8 max-w-xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Add New Warehouse</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           placeholder="Warehouse Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//           className="w-full p-2 border rounded"
//         />
//         {pincodes.map((pin, i) => (
//           <input
//             key={i}
//             type="text"
//             placeholder={`Pincode ${i + 1}`}
//             value={pin}
//             onChange={(e) => handleChange(i, e.target.value)}
//             required
//             className="w-full p-2 border rounded"
//           />
//         ))}

//         <input
//           type="text"
//           placeholder="Manager Username"
//           value={manager.username}
//           onChange={(e) => setManager({ ...manager, username: e.target.value })}
//           required
//           className="w-full p-2 border rounded"
//         />
//         <input
//           type="email"
//           placeholder="Manager Email"
//           value={manager.email}
//           onChange={(e) => setManager({ ...manager, email: e.target.value })}
//           required
//           className="w-full p-2 border rounded"
//         />
//         <input
//           type="password"
//           placeholder="Manager Password"
//           value={manager.password}
//           onChange={(e) => setManager({ ...manager, password: e.target.value })}
//           required
//           className="w-full p-2 border rounded"
//         />

//         <button
//           type="submit"
//           className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//         >
//           Add Warehouse
//         </button>
//       </form>
//       {message && <p className="mt-4 text-red-500">{message}</p>}
//     </div>
//   );
// }
'use client';

import { useState } from 'react';

export default function AddWarehousePage() {
  const [name, setName] = useState('');
  // ✅ Changed state for the warehouse's physical address
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  // ✅ Changed state name to be more descriptive
  const [serviceablePincodes, setServiceablePincodes] = useState(['', '', '', '', '']);
  
  // ✅ Changed state to include all new manager fields
  const [manager, setManager] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    contactNumber: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for the 5 serviceable pincode inputs
  const handlePincodeChange = (index: number, value: string) => {
    const updated = [...serviceablePincodes];
    updated[index] = value;
    setServiceablePincodes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // ✅ Changed payload to match the new schema structure
    const payload = {
      name,
      address,
      serviceablePincodes,
      manager,
    };

    const res = await fetch('/api/manager/makeWarehouse/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage('Warehouse created successfully!');
      // ✅ Reset all fields after success
      setName('');
      setAddress({ street: '', city: '', state: '', pincode: '' });
      setServiceablePincodes(['', '', '', '', '']);
      setManager({ fullName: '', username: '', email: '', password: '', contactNumber: '' });
    } else {
      setMessage(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Warehouse</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Warehouse Details */}
        <fieldset className="border p-4 rounded">
          <legend className="text-lg font-semibold px-2">Warehouse Details</legend>
          <input
            type="text" placeholder="Warehouse Name" value={name}
            onChange={(e) => setName(e.target.value)} required
            className="w-full p-2 border rounded mt-2"
          />
          {/* ✅ Added Address Fields */}
          <input
            type="text" placeholder="Street Address" value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
          <div className="flex gap-4 mt-2">
            <input
              type="text" placeholder="City" value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })} required
              className="w-full p-2 border rounded"
            />
            <input
              type="text" placeholder="State" value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })} required
              className="w-full p-2 border rounded"
            />
          </div>
          <input
            type="text" placeholder="Primary Pincode" value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
        </fieldset>
        
        {/* Serviceable Pincodes */}
        <fieldset className="border p-4 rounded">
          <legend className="text-lg font-semibold px-2">Serviceable Pincodes</legend>
          {serviceablePincodes.map((pin, i) => (
            <input
              key={i} type="text" placeholder={`Serviceable Pincode ${i + 1}`}
              value={pin} onChange={(e) => handlePincodeChange(i, e.target.value)} required
              className="w-full p-2 border rounded mt-2"
            />
          ))}
        </fieldset>

        {/* Manager Details */}
        <fieldset className="border p-4 rounded">
          <legend className="text-lg font-semibold px-2">Manager Details</legend>
          {/* ✅ Added Manager Fields */}
          <input
            type="text" placeholder="Manager Full Name" value={manager.fullName}
            onChange={(e) => setManager({ ...manager, fullName: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
          <input
            type="text" placeholder="Manager Username" value={manager.username}
            onChange={(e) => setManager({ ...manager, username: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
          <input
            type="email" placeholder="Manager Email" value={manager.email}
            onChange={(e) => setManager({ ...manager, email: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
           <input
            type="text" placeholder="Manager Contact Number" value={manager.contactNumber}
            onChange={(e) => setManager({ ...manager, contactNumber: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
          <input
            type="password" placeholder="Manager Password" value={manager.password}
            onChange={(e) => setManager({ ...manager, password: e.target.value })} required
            className="w-full p-2 border rounded mt-2"
          />
        </fieldset>

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Add Warehouse'}
        </button>
      </form>
      {message && <p className={`mt-4 ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
    </div>
  );
}