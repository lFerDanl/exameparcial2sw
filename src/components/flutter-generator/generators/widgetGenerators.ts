export const generateRectangleWidget = () => {
  return `import 'package:flutter/material.dart';

class RectangleWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;

  const RectangleWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 255,
                  fill!['g'] ?? 255,
                  fill!['b'] ?? 255,
                  (opacity ?? 100) / 100,
                )
              : null,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: cornerRadius != null 
              ? BorderRadius.circular(cornerRadius!) 
              : null,
        ),
      ),
    );
  }
}
`;
};

export const generateEllipseWidget = () => {
  return `import 'package:flutter/material.dart';

class EllipseWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;

  const EllipseWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 255,
                  fill!['g'] ?? 255,
                  fill!['b'] ?? 255,
                  (opacity ?? 100) / 100,
                )
              : null,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: BorderRadius.circular(width / 2),
        ),
      ),
    );
  }
}
`;
};

export const generateTextWidget = () => {
  return `import 'package:flutter/material.dart';

class TextWidget extends StatelessWidget {
  final double x;
  final double y;
  final String text;
  final double? fontSize;
  final String? fontFamily;
  final String? fontWeight;
  final Map<String, dynamic>? fill;
  final double? opacity;

  const TextWidget({
    super.key,
    required this.x,
    required this.y,
    required this.text,
    this.fontSize,
    this.fontFamily,
    this.fontWeight,
    this.fill,
    this.opacity,
  });

  FontWeight _getFontWeight(String? weight) {
    if (weight == null) return FontWeight.normal;
    
    // Convertir peso numérico a FontWeight
    switch (weight) {
      case '100':
        return FontWeight.w100;
      case '200':
        return FontWeight.w200;
      case '300':
        return FontWeight.w300;
      case '400':
        return FontWeight.w400;
      case '500':
        return FontWeight.w500;
      case '600':
        return FontWeight.w600;
      case '700':
        return FontWeight.w700;
      case '800':
        return FontWeight.w800;
      case '900':
        return FontWeight.w900;
      case 'bold':
        return FontWeight.bold;
      default:
        return FontWeight.normal;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize ?? 16,
          fontFamily: fontFamily ?? 'Arial',
          fontWeight: _getFontWeight(fontWeight),
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 0,
                  fill!['g'] ?? 0,
                  fill!['b'] ?? 0,
                  (opacity ?? 100) / 100,
                )
              : Colors.black, // Color por defecto
        ),
      ),
    );
  }
}
`;
};

export const generateInputWidget = () => {
  return `import 'package:flutter/material.dart';

class InputWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final String? placeholder;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const InputWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    this.placeholder,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  State<InputWidget> createState() => _InputWidgetState();
}

class _InputWidgetState extends State<InputWidget> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.fill != null
              ? Color.fromRGBO(
                  widget.fill!['r'] ?? 255,
                  widget.fill!['g'] ?? 255,
                  widget.fill!['b'] ?? 255,
                  (widget.opacity ?? 100) / 100,
                )
              : Colors.white,
          border: widget.stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    widget.stroke!['r'] ?? 0,
                    widget.stroke!['g'] ?? 0,
                    widget.stroke!['b'] ?? 0,
                    (widget.opacity ?? 100) / 100,
                  ),
                )
              : Border.all(color: Colors.grey),
          borderRadius: widget.cornerRadius != null 
              ? BorderRadius.circular(widget.cornerRadius!) 
              : BorderRadius.circular(4),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: TextField(
            controller: _controller,
            style: TextStyle(
              fontSize: widget.fontSize ?? 14,
              fontFamily: widget.fontFamily ?? 'Arial',
              color: widget.textFill != null
                  ? Color.fromRGBO(
                      widget.textFill!['r'] ?? 0,
                      widget.textFill!['g'] ?? 0,
                      widget.textFill!['b'] ?? 0,
                      (widget.opacity ?? 100) / 100,
                    )
                  : Colors.black,
            ),
            decoration: InputDecoration(
              hintText: widget.placeholder ?? 'Enter text...',
              border: InputBorder.none,
              hintStyle: TextStyle(
                color: widget.textFill != null
                    ? Color.fromRGBO(
                        widget.textFill!['r'] ?? 0,
                        widget.textFill!['g'] ?? 0,
                        widget.textFill!['b'] ?? 0,
                        0.5,
                      )
                    : Colors.grey,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

export const generateButtonWidget = () => {
  return `import 'package:flutter/material.dart';

class ButtonWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final String text;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const ButtonWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.text,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 33,
                  fill!['g'] ?? 150,
                  fill!['b'] ?? 243,
                  (opacity ?? 100) / 100,
                )
              : Colors.blue,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: cornerRadius != null 
              ? BorderRadius.circular(cornerRadius!) 
              : BorderRadius.circular(8),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: cornerRadius != null 
                ? BorderRadius.circular(cornerRadius!) 
                : BorderRadius.circular(8),
            onTap: () {
              // Acción del botón
              print('Button "$text" pressed');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Button "$text" pressed'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
            child: Center(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: fontSize ?? 16,
                  fontFamily: fontFamily ?? 'Arial',
                  fontWeight: FontWeight.w500,
                  color: textFill != null
                      ? Color.fromRGBO(
                          textFill!['r'] ?? 255,
                          textFill!['g'] ?? 255,
                          textFill!['b'] ?? 255,
                          (opacity ?? 100) / 100,
                        )
                      : Colors.white,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

export const generateSelectorWidget = () => {
  return `import 'package:flutter/material.dart';

class SelectorWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final List<String> options;
  final String? selectedOption;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const SelectorWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.options,
    this.selectedOption,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  State<SelectorWidget> createState() => _SelectorWidgetState();
}

class _SelectorWidgetState extends State<SelectorWidget> {
  String? selectedValue;

  @override
  void initState() {
    super.initState();
    selectedValue = widget.selectedOption ?? 
        (widget.options.isNotEmpty ? widget.options.first : null);
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.fill != null
              ? Color.fromRGBO(
                  widget.fill!['r'] ?? 255,
                  widget.fill!['g'] ?? 255,
                  widget.fill!['b'] ?? 255,
                  (widget.opacity ?? 100) / 100,
                )
              : Colors.white,
          border: widget.stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    widget.stroke!['r'] ?? 0,
                    widget.stroke!['g'] ?? 0,
                    widget.stroke!['b'] ?? 0,
                    (widget.opacity ?? 100) / 100,
                  ),
                )
              : Border.all(color: Colors.grey),
          borderRadius: widget.cornerRadius != null 
              ? BorderRadius.circular(widget.cornerRadius!) 
              : BorderRadius.circular(4),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedValue,
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down),
              style: TextStyle(
                fontSize: widget.fontSize ?? 14,
                fontFamily: widget.fontFamily ?? 'Arial',
                color: widget.textFill != null
                    ? Color.fromRGBO(
                        widget.textFill!['r'] ?? 0,
                        widget.textFill!['g'] ?? 0,
                        widget.textFill!['b'] ?? 0,
                        (widget.opacity ?? 100) / 100,
                      )
                    : Colors.black,
              ),
              items: widget.options.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              onChanged: (String? newValue) {
                setState(() {
                  selectedValue = newValue;
                });
                print('Selected: $newValue');
              },
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

export const generateCheckboxWidget = () => {
  return `import 'package:flutter/material.dart';

class CheckboxWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final bool checked;
  final String label;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const CheckboxWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.checked,
    required this.label,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  State<CheckboxWidget> createState() => _CheckboxWidgetState();
}

class _CheckboxWidgetState extends State<CheckboxWidget> {
  late bool isChecked;

  @override
  void initState() {
    super.initState();
    isChecked = widget.checked;
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Padding(
        padding: EdgeInsets.only(left: widget.x, top: widget.y),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Transform.scale(
              scale: 1.2,
              child: Checkbox(
                value: isChecked,
                onChanged: (bool? value) {
                  setState(() {
                    isChecked = value ?? false;
                  });
                  print('Checkbox is now: \${isChecked ? "checked" : "unchecked"}');
                },
                activeColor: widget.fill != null
                    ? Color.fromRGBO(
                        widget.fill!['r'] ?? 33,
                        widget.fill!['g'] ?? 150,
                        widget.fill!['b'] ?? 243,
                        (widget.opacity ?? 100) / 100,
                      )
                    : Colors.blue,
                checkColor: Colors.white,
                side: widget.stroke != null
                    ? BorderSide(
                        color: Color.fromRGBO(
                          widget.stroke!['r'] ?? 0,
                          widget.stroke!['g'] ?? 0,
                          widget.stroke!['b'] ?? 0,
                          (widget.opacity ?? 100) / 100,
                        ),
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              widget.label,
              style: TextStyle(
                fontSize: widget.fontSize ?? 14,
                fontFamily: widget.fontFamily ?? 'Arial',
                color: widget.textFill != null
                    ? Color.fromRGBO(
                        widget.textFill!['r'] ?? 0,
                        widget.textFill!['g'] ?? 0,
                        widget.textFill!['b'] ?? 0,
                        (widget.opacity ?? 100) / 100,
                      )
                    : Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`;
};

export const generateDatePickerWidget = () => {
  return `import 'package:flutter/material.dart';

class DatePickerWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final String value;
  final String? placeholder;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;
  final String? format;

  const DatePickerWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.value,
    this.placeholder,
    this.fontSize,
    this.fontFamily,
    this.textFill,
    this.format,
  });

  @override
  State<DatePickerWidget> createState() => _DatePickerWidgetState();
}

class _DatePickerWidgetState extends State<DatePickerWidget> {
  DateTime? selectedDate;
  late String displayText;

  @override
  void initState() {
    super.initState();
    if (widget.value.isNotEmpty) {
      try {
        selectedDate = DateTime.parse(widget.value);
        displayText = _formatDate(selectedDate!);
      } catch (e) {
        displayText = widget.placeholder ?? 'Select date...';
      }
    } else {
      displayText = widget.placeholder ?? 'Select date...';
    }
  }

  String _formatDate(DateTime date) {
    final format = widget.format ?? 'dd/MM/yyyy';
    switch (format) {
      case 'MM/dd/yyyy':
        return '\${date.month.toString().padLeft(2, '0')}/\${date.day.toString().padLeft(2, '0')}/\${date.year}';
      case 'yyyy-MM-dd':
        return '\${date.year}-\${date.month.toString().padLeft(2, '0')}-\${date.day.toString().padLeft(2, '0')}';
      default:
        return '\${date.day.toString().padLeft(2, '0')}/\${date.month.toString().padLeft(2, '0')}/\${date.year}';
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != selectedDate) {
      setState(() {
        selectedDate = picked;
        displayText = _formatDate(picked);
      });
      print('Date selected: \${_formatDate(picked)}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.fill != null
              ? Color.fromRGBO(
                  widget.fill!['r'] ?? 255,
                  widget.fill!['g'] ?? 255,
                  widget.fill!['b'] ?? 255,
                  (widget.opacity ?? 100) / 100,
                )
              : Colors.white,
          border: widget.stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    widget.stroke!['r'] ?? 0,
                    widget.stroke!['g'] ?? 0,
                    widget.stroke!['b'] ?? 0,
                    (widget.opacity ?? 100) / 100,
                  ),
                )
              : Border.all(color: Colors.grey),
          borderRadius: widget.cornerRadius != null 
              ? BorderRadius.circular(widget.cornerRadius!) 
              : BorderRadius.circular(4),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: widget.cornerRadius != null 
                ? BorderRadius.circular(widget.cornerRadius!) 
                : BorderRadius.circular(4),
            onTap: () => _selectDate(context),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      displayText,
                      style: TextStyle(
                        fontSize: widget.fontSize ?? 14,
                        fontFamily: widget.fontFamily ?? 'Arial',
                        color: widget.textFill != null
                            ? Color.fromRGBO(
                                widget.textFill!['r'] ?? 0,
                                widget.textFill!['g'] ?? 0,
                                widget.textFill!['b'] ?? 0,
                                (widget.opacity ?? 100) / 100,
                              )
                            : (selectedDate != null ? Colors.black : Colors.grey),
                      ),
                    ),
                  ),
                  Icon(
                    Icons.calendar_today,
                    size: 16,
                    color: widget.textFill != null
                        ? Color.fromRGBO(
                            widget.textFill!['r'] ?? 0,
                            widget.textFill!['g'] ?? 0,
                            widget.textFill!['b'] ?? 0,
                            (widget.opacity ?? 100) / 100,
                          )
                        : Colors.grey,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

export const generateTimePickerWidget = () => {
  return `import 'package:flutter/material.dart';

class TimePickerWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final String value;
  final String? placeholder;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;
  final String? format;

  const TimePickerWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.value,
    this.placeholder,
    this.fontSize,
    this.fontFamily,
    this.textFill,
    this.format,
  });

  @override
  State<TimePickerWidget> createState() => _TimePickerWidgetState();
}

class _TimePickerWidgetState extends State<TimePickerWidget> {
  TimeOfDay? selectedTime;
  late String displayText;

  @override
  void initState() {
    super.initState();
    if (widget.value.isNotEmpty) {
      try {
        final parts = widget.value.split(':');
        if (parts.length >= 2) {
          final hour = int.parse(parts[0]);
          final minute = int.parse(parts[1]);
          selectedTime = TimeOfDay(hour: hour, minute: minute);
          displayText = _formatTime(selectedTime!);
        } else {
          displayText = widget.placeholder ?? 'Select time...';
        }
      } catch (e) {
        displayText = widget.placeholder ?? 'Select time...';
      }
    } else {
      displayText = widget.placeholder ?? 'Select time...';
    }
  }

  String _formatTime(TimeOfDay time) {
    final format = widget.format ?? '24h';
    if (format == '12h') {
      final hour = time.hourOfPeriod;
      final minute = time.minute.toString().padLeft(2, '0');
      final period = time.period == DayPeriod.am ? 'AM' : 'PM';
      return '\${hour == 0 ? 12 : hour}:\${minute} \${period}';
    } else {
      return '\${time.hour.toString().padLeft(2, '0')}:\${time.minute.toString().padLeft(2, '0')}';
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: selectedTime ?? TimeOfDay.now(),
    );
    if (picked != null && picked != selectedTime) {
      setState(() {
        selectedTime = picked;
        displayText = _formatTime(picked);
      });
      print('Time selected: \${_formatTime(picked)}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.fill != null
              ? Color.fromRGBO(
                  widget.fill!['r'] ?? 255,
                  widget.fill!['g'] ?? 255,
                  widget.fill!['b'] ?? 255,
                  (widget.opacity ?? 100) / 100,
                )
              : Colors.white,
          border: widget.stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    widget.stroke!['r'] ?? 0,
                    widget.stroke!['g'] ?? 0,
                    widget.stroke!['b'] ?? 0,
                    (widget.opacity ?? 100) / 100,
                  ),
                )
              : Border.all(color: Colors.grey),
          borderRadius: widget.cornerRadius != null 
              ? BorderRadius.circular(widget.cornerRadius!) 
              : BorderRadius.circular(4),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: widget.cornerRadius != null 
                ? BorderRadius.circular(widget.cornerRadius!) 
                : BorderRadius.circular(4),
            onTap: () => _selectTime(context),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      displayText,
                      style: TextStyle(
                        fontSize: widget.fontSize ?? 14,
                        fontFamily: widget.fontFamily ?? 'Arial',
                        color: widget.textFill != null
                            ? Color.fromRGBO(
                                widget.textFill!['r'] ?? 0,
                                widget.textFill!['g'] ?? 0,
                                widget.textFill!['b'] ?? 0,
                                (widget.opacity ?? 100) / 100,
                              )
                            : (selectedTime != null ? Colors.black : Colors.grey),
                      ),
                    ),
                  ),
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: widget.textFill != null
                        ? Color.fromRGBO(
                            widget.textFill!['r'] ?? 0,
                            widget.textFill!['g'] ?? 0,
                            widget.textFill!['b'] ?? 0,
                            (widget.opacity ?? 100) / 100,
                          )
                        : Colors.grey,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}`;
};

export const generateBackgroundWidget = () => {
  return `import 'package:flutter/material.dart';

class BackgroundWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;

  const BackgroundWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 255,
                  fill!['g'] ?? 255,
                  fill!['b'] ?? 255,
                  (opacity ?? 100) / 100,
                )
              : null,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: cornerRadius != null 
              ? BorderRadius.circular(cornerRadius!) 
              : null,
        ),
      ),
    );
  }
}
`;
}; 