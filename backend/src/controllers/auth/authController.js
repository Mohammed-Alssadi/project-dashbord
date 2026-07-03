export const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching me:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ success: true, data: {} });
};
