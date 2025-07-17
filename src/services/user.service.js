const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/**
 * البحث عن مستخدم أو إنشاء واحد جديد من OAuth profile
 * @param {object} profile - بيانات المستخدم المُوحدة من Passport
 * @returns {Promise<User>}
 */
const findOrCreateUser = async (profile) => {
  try {
    // البحث أولاً عن المستخدم بمعرف المزود
    let user = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
    });

    if (user) {
      // تحديث آخر تسجيل دخول
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          // تحديث الصورة والاسم في حالة تغييرهما
          avatar: profile.avatar || user.avatar,
          name: profile.name || user.name,
        },
      });
      return user;
    }

    // البحث عن مستخدم بنفس البريد الإلكتروني (ربط الحسابات)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUserByEmail) {
      // ربط حساب OAuth بحساب موجود
      user = await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          provider: profile.provider,
          providerId: profile.providerId,
          avatar: profile.avatar || existingUserByEmail.avatar,
          lastLogin: new Date(),
        },
      });
      return user;
    }

    // إنشاء مستخدم جديد
    user = await prisma.user.create({
      data: {
        provider: profile.provider,
        providerId: profile.providerId,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        emailVerified: true, // OAuth users are pre-verified
        lastLogin: new Date(),
      },
    });

    return user;
  } catch (error) {
    console.error("❌ Error in findOrCreateUser:", error);
    throw new Error("Failed to find or create user");
  }
};

/**
 * إنشاء مستخدم محلي جديد
 * @param {object} userData - بيانات المستخدم {name, email, password}
 * @returns {Promise<User>}
 */
const createLocalUser = async (userData) => {
  try {
    const { email, password, name } = userData;

    // التحقق من عدم وجود مستخدم بنفس البريد
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: "local",
        lastLogin: new Date(),
      },
    });

    return user;
  } catch (error) {
    console.error("❌ Error creating local user:", error);
    throw error;
  }
};

/**
 * البحث عن مستخدم بالبريد الإلكتروني
 * @param {string} email
 * @returns {Promise<User|null>}
 */
const findUserByEmail = async (email) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error("❌ Error finding user by email:", error);
    return null;
  }
};

/**
 * البحث عن مستخدم بالمعرف
 * @param {string} id
 * @returns {Promise<User|null>}
 */
const findUserById = async (id) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        // استثناء كلمة المرور
      },
    });
  } catch (error) {
    console.error("❌ Error finding user by ID:", error);
    return null;
  }
};

/**
 * التحقق من كلمة المرور للمستخدم المحلي
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User|null>}
 */
const verifyLocalUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.provider !== "local" || !user.password) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // تحديث آخر تسجيل دخول
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return updatedUser;
  } catch (error) {
    console.error("❌ Error verifying local user:", error);
    return null;
  }
};

/**
 * تحديث بيانات المستخدم
 * @param {string} userId
 * @param {object} updateData
 * @returns {Promise<User>}
 */
const updateUser = async (userId, updateData) => {
  try {
    // إزالة الحقول الحساسة من التحديث
    const { password, id, providerId, ...safeUpdateData } = updateData;

    return await prisma.user.update({
      where: { id: userId },
      data: safeUpdateData,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

/**
 * حذف مستخدم (تعطيل الحساب)
 * @param {string} userId
 * @returns {Promise<User>}
 */
const deactivateUser = async (userId) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  } catch (error) {
    console.error("❌ Error deactivating user:", error);
    throw new Error("Failed to deactivate user");
  }
};

module.exports = {
  findOrCreateUser,
  createLocalUser,
  findUserByEmail,
  findUserById,
  verifyLocalUser,
  updateUser,
  deactivateUser,
};
