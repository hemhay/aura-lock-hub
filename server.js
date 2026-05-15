require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.set('view engine', 'hbs');
app.use(express.json()); 
app.use(express.static('public'));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route to render the dashboard
app.get('/', async (req, res) => {
    const { data: logs, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
    res.render('index', { logs });
});

// Route triggered by the Unlock button
app.post('/unlock', async (req, res) => {
    const { error } = await supabase
        .from('remote_commands')
        .insert([{ command: 'UNLOCK_DOOR' }]);
        
    if (error) return res.status(500).send('Error');
    
    // Log the web unlock action
    await supabase.from('access_logs').insert([{ auth_method: 'Web App', status: 'Granted' }]);
    
    res.status(200).send('Command Sent');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));