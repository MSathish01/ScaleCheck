import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_theme.dart';
import 'providers/inspection_provider.dart';
import 'screens/login_screen.dart';
import 'widgets/app_frame.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ScaleCheckApp());
}

class ScaleCheckApp extends StatelessWidget {
  const ScaleCheckApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => InspectionProvider()),
      ],
      child: MaterialApp(
        title: 'ScaleCheck Mobile',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        builder: (context, child) {
          return AppFrame(child: child ?? const SizedBox.shrink());
        },
        home: const LoginScreen(),
      ),
    );
  }
}
