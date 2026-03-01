import dns from 'node:dns';

const host = 'aws-1-ap-southeast-2.pooler.supabase.com';

dns.lookup(host, (err, address, family) => {
    if (err) {
        console.error('DNS Lookup failed for host:', host);
        console.error(err);
    } else {
        console.log(`Successfully resolved ${host} to ${address} (family: IPv${family})`);
    }
});
